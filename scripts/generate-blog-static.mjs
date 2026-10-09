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
 * De onde vêm os artigos: `scripts/lib/load-posts.mjs` (arquivos .md,
 * content/posts.json e Supabase, nessa ordem de prioridade).
 *
 * Sem nenhuma origem, o script avisa e não falha o build: o site continua
 * publicando normalmente, só sem as páginas estáticas do blog.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadRenderer } from './lib/bundle.mjs';
import { loadPosts } from './lib/load-posts.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

/* ------------------------------------------------------------------ */
/* 1. Montar cada página a partir do index.html do build               */
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
/* 2. Execução                                                         */
/* ------------------------------------------------------------------ */

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.error('[blog] dist/index.html não existe. Rode o build do Vite antes.');
    process.exitCode = 1;
    return;
  }

  const renderer = await loadRenderer();
  const { posts } = await loadPosts(renderer);
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8');

  const pages = renderer.buildStaticPages(posts);

  for (const page of pages) {
    const target = path.join(DIST, page.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buildPageHtml(shell, page), 'utf8');
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), renderer.buildSitemap(posts), 'utf8');
  await writeFile(path.join(DIST, 'rss.xml'), renderer.buildRssFeed(posts), 'utf8');

  console.log(
    `[blog] ${pages.length} página(s) estática(s), sitemap.xml e rss.xml gerados em dist/.`
  );

  if (posts.length === 0) {
    console.warn(
      '[blog] Nenhum artigo encontrado. Escreva em content/artigos/*.md, ' +
        'exporte content/posts.json pelo painel admin ou configure o Supabase.'
    );
  }
}

main().catch((error) => {
  console.error('[blog] Falha ao gerar as páginas estáticas:', error);
  process.exitCode = 1;
});
