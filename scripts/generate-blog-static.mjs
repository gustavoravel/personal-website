/**
 * Gera as páginas estáticas do blog, o sitemap e o RSS depois do `vite build`.
 *
 * O que este script resolve:
 *
 * - Link de artigo colado no WhatsApp mostrando a prévia da home. WhatsApp,
 *   Facebook e LinkedIn leem o HTML sem executar JavaScript, então precisam
 *   encontrar as meta tags do artigo já escritas no arquivo.
 * - Artigo que o Google demora (ou deixa) de indexar por depender de
 *   JavaScript para existir.
 *
 * De onde vêm os artigos, nesta ordem:
 *   1. `content/posts.json` — exportado pelo painel admin ("Exportar para o
 *      build"). É a fonte quando não há Supabase.
 *   2. Supabase, se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY existirem.
 *
 * Sem nenhuma das duas, o script avisa e não falha o build: o site continua
 * publicando normalmente, só sem as páginas estáticas do blog.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, 'node_modules', '.cache', 'blog-static');

/* ------------------------------------------------------------------ */
/* 1. Compilar o renderizador (TypeScript) para uso no Node            */
/* ------------------------------------------------------------------ */

async function loadRenderer() {
  await build({
    configFile: false,
    logLevel: 'error',
    build: {
      ssr: path.join('src', 'lib', 'staticRender.ts'),
      outDir: path.relative(ROOT, CACHE),
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        output: { entryFileNames: 'staticRender.mjs', format: 'es' },
      },
    },
  });

  return import(pathToFileURL(path.join(CACHE, 'staticRender.mjs')).href);
}

/* ------------------------------------------------------------------ */
/* 2. Carregar os artigos                                              */
/* ------------------------------------------------------------------ */

/** A tabela usa snake_case; o app, camelCase. */
function rowToPost(row) {
  return {
    id: String(row.id),
    title: row.title ?? '',
    slug: row.slug ?? '',
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    blocks: row.blocks ?? undefined,
    category: row.category ?? 'Geral',
    tags: row.tags ?? [],
    readTime: row.read_time ?? '4 min',
    publishedAt: String(row.published_at ?? '').slice(0, 10),
    updatedAt: row.updated_at ? String(row.updated_at).slice(0, 10) : undefined,
    author: row.author ?? 'Gustavo Ravel',
    featuredImage: row.featured_image ?? '',
    featuredImageAlt: row.featured_image_alt ?? '',
    seo: row.seo ?? {},
    isPublished: Boolean(row.is_published),
  };
}

/** Lê VITE_* do ambiente ou do .env, sem depender de dotenv. */
async function readEnv(key) {
  if (process.env[key]) return process.env[key];

  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return '';

  const content = await readFile(envPath, 'utf8');
  const match = content.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

async function loadPosts() {
  const filePath = path.join(ROOT, 'content', 'posts.json');
  if (existsSync(filePath)) {
    const parsed = JSON.parse(await readFile(filePath, 'utf8'));
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`[blog] ${parsed.length} artigo(s) lidos de content/posts.json`);
      return parsed;
    }
  }

  const url = await readEnv('VITE_SUPABASE_URL');
  const key = await readEnv('VITE_SUPABASE_ANON_KEY');
  if (!url || !key) return [];

  try {
    const response = await fetch(
      `${url}/rest/v1/blog_posts?select=*&is_published=eq.true&order=published_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!response.ok) {
      console.warn(`[blog] Supabase respondeu ${response.status}; nada foi gerado.`);
      return [];
    }
    const rows = await response.json();
    console.log(`[blog] ${rows.length} artigo(s) lidos do Supabase`);
    return rows.map(rowToPost);
  } catch (error) {
    console.warn(`[blog] Não foi possível ler o Supabase: ${error.message}`);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* 3. Montar cada página a partir do index.html do build               */
/* ------------------------------------------------------------------ */

/**
 * Remove do <head> as tags que descrevem a home, para não ficarem duas
 * `og:title` na mesma página — nesse caso o WhatsApp escolhe a errada.
 */
function stripHomeHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
}

function buildPageHtml(shell, page) {
  const withoutHomeHead = stripHomeHead(shell);

  const html = withoutHomeHead.replace('</head>', `  ${page.head}\n  </head>`);

  // O conteúdo entra dentro de #root: o React substitui na hidratação, mas
  // quem não executa JavaScript (robô de prévia, leitor sem JS) já lê o artigo.
  return html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${page.body}</div>`
  );
}

/* ------------------------------------------------------------------ */
/* 4. Execução                                                         */
/* ------------------------------------------------------------------ */

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.error('[blog] dist/index.html não existe. Rode o build do Vite antes.');
    process.exitCode = 1;
    return;
  }

  const posts = await loadPosts();
  const renderer = await loadRenderer();
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8');

  const pages = renderer.buildStaticPages(posts);

  for (const page of pages) {
    const target = path.join(DIST, page.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buildPageHtml(shell, page), 'utf8');
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), renderer.buildSitemap(posts), 'utf8');
  await writeFile(path.join(DIST, 'rss.xml'), renderer.buildRssFeed(posts), 'utf8');

  await rm(CACHE, { recursive: true, force: true });

  console.log(
    `[blog] ${pages.length} página(s) estática(s), sitemap.xml e rss.xml gerados em dist/.`
  );

  if (posts.length === 0) {
    console.warn(
      '[blog] Nenhum artigo encontrado. Exporte content/posts.json pelo painel admin ' +
        '(aba Blog > "Exportar para o build") ou configure o Supabase.'
    );
  }
}

main().catch((error) => {
  console.error('[blog] Falha ao gerar as páginas estáticas:', error);
  process.exitCode = 1;
});
