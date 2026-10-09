import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Reúne os artigos do blog das três origens possíveis e resolve conflitos.
 *
 * Origens, da que manda mais para a que manda menos quando o `slug` repete:
 *
 *  1. `content/posts.json` — exportado do editor de blocos no `/admin`.
 *     Ganha de todas: é onde um artigo é ajustado à mão. Esse é o caminho de
 *     "promoção": se a automação escreveu um artigo e você quis remontar os
 *     blocos no editor, importe o `.md`, exporte o `posts.json` e a sua versão
 *     passa a valer.
 *  2. `content/artigos/*.md` — artigos como arquivo de texto. É o que a
 *     automação de escrita produz, revisado via Pull Request.
 *  3. Supabase — artigos escritos direto no `/admin` em outro computador.
 *
 * Nenhuma origem é obrigatória. Sem nenhuma delas, o blog fica vazio e o
 * build avisa, em vez de falhar.
 */

const ROOT = process.cwd();

/** A tabela do Supabase usa snake_case; o app, camelCase. */
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

/** Lê uma variável VITE_* do ambiente ou do `.env`, sem depender de dotenv. */
async function readEnv(key) {
  if (process.env[key]) return process.env[key];

  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return '';

  const content = await readFile(envPath, 'utf8');
  const match = content.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

async function fromMarkdownFiles(renderer) {
  const dir = path.join(ROOT, 'content', 'artigos');
  if (!existsSync(dir)) return [];

  const files = (await readdir(dir)).filter((name) => /\.mdx?$/i.test(name));
  const posts = [];

  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const fallbackSlug = file.replace(/\.mdx?$/i, '');
    try {
      posts.push(renderer.postFromMarkdown(raw, fallbackSlug));
    } catch (error) {
      // Um arquivo quebrado não deve derrubar a publicação do site inteiro.
      console.warn(`[blog] Ignorando content/artigos/${file}: ${error.message}`);
    }
  }

  if (posts.length > 0) {
    console.log(`[blog] ${posts.length} artigo(s) em content/artigos/*.md`);
  }

  return posts;
}

async function fromPostsJson() {
  const filePath = path.join(ROOT, 'content', 'posts.json');
  if (!existsSync(filePath)) return [];

  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8'));
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0) {
      console.log(`[blog] ${parsed.length} artigo(s) em content/posts.json`);
    }
    return parsed;
  } catch (error) {
    console.warn(`[blog] content/posts.json inválido: ${error.message}`);
    return [];
  }
}

async function fromSupabase() {
  const url = await readEnv('VITE_SUPABASE_URL');
  const key = await readEnv('VITE_SUPABASE_ANON_KEY');
  if (!url || !key) return [];

  try {
    const response = await fetch(
      `${url}/rest/v1/blog_posts?select=*&is_published=eq.true&order=published_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!response.ok) {
      console.warn(`[blog] Supabase respondeu ${response.status}; ignorando essa origem.`);
      return [];
    }
    const rows = await response.json();
    if (rows.length > 0) console.log(`[blog] ${rows.length} artigo(s) no Supabase`);
    return rows.map(rowToPost);
  } catch (error) {
    console.warn(`[blog] Supabase inacessível (${error.message}); ignorando essa origem.`);
    return [];
  }
}

export async function loadPosts(renderer) {
  const [supabase, markdown, json] = await Promise.all([
    fromSupabase(),
    fromMarkdownFiles(renderer),
    fromPostsJson(),
  ]);

  // Inserido do que manda menos para o que manda mais: o último a escrever o
  // mesmo slug é quem fica.
  const bySlug = new Map();
  [...supabase, ...markdown, ...json].forEach((post) => {
    if (post?.slug) bySlug.set(post.slug, post);
  });

  const posts = Array.from(bySlug.values()).sort((a, b) =>
    (a.publishedAt || '') < (b.publishedAt || '') ? 1 : -1
  );

  console.log(`[blog] ${posts.length} artigo(s) no total depois de resolver os slugs repetidos.`);
  return posts;
}
