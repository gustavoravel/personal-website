import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Reúne os artigos do blog das três origens possíveis e resolve conflitos.
 *
 * Origens, da que manda MAIS para a que manda menos quando o `slug` repete:
 *
 *  1. **Supabase** — é onde você escreve e publica, pelo editor do `/admin`.
 *     Decisão de out/2026: publicar no painel basta, sem exportar arquivo.
 *  2. `content/artigos/*.md` — artigos como arquivo de texto. É o que a
 *     automação de escrita produz, revisado via Pull Request. Esses artigos
 *     não existem no banco, então aparecem normalmente; o Supabase só ganha
 *     deles se você importar o `.md` no editor e publicar por lá.
 *  3. `content/posts.json` — exportação do editor. Virou reserva: segura o
 *     blog quando o build roda sem o banco. Se divergir, o build avisa.
 *
 * O preço dessa ordem: o plano gratuito do Supabase pausa o projeto sozinho, e
 * um build feito com ele fora do ar não enxerga os artigos que só existem lá.
 * Daí as duas proteções: o keepalive em
 * `.github/workflows/supabase-keepalive.yml` e a trava em
 * `generate-blog-data.mjs`, que recusa publicar uma lista menor quando o banco
 * não respondeu.
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

  const files = (await readdir(dir)).filter(
    (name) =>
      /\.mdx?$/i.test(name) &&
      // Documentação e arquivos auxiliares não são artigos. Sem isto o README
      // da pasta virava um artigo publicado, com página própria e entrada no
      // sitemap.
      !/^(readme|_)/i.test(name) &&
      !name.startsWith('.')
  );

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

/**
 * Lê o banco. Devolve também `ok`: a trava de segurança do build depende de
 * saber a diferença entre "o banco disse que não há artigos" e "o banco não
 * respondeu".
 */
async function fromSupabase() {
  const url = await readEnv('VITE_SUPABASE_URL');
  const key = await readEnv('VITE_SUPABASE_ANON_KEY');
  if (!url || !key) {
    console.warn('[blog] Sem VITE_SUPABASE_URL/ANON_KEY; o banco não foi consultado.');
    return { posts: [], ok: false };
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/blog_posts?select=*&is_published=eq.true&order=published_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!response.ok) {
      console.warn(`[blog] Supabase respondeu ${response.status}; ignorando essa origem.`);
      return { posts: [], ok: false };
    }
    const rows = await response.json();
    if (rows.length > 0) console.log(`[blog] ${rows.length} artigo(s) no Supabase`);
    return { posts: rows.map(rowToPost), ok: true };
  } catch (error) {
    console.warn(`[blog] Supabase inacessível (${error.message}); ignorando essa origem.`);
    console.warn('[blog] Se o projeto estiver pausado, reative em https://supabase.com/dashboard');
    return { posts: [], ok: false };
  }
}

/**
 * Avisa quando o `posts.json` discorda do banco.
 *
 * Não é erro: o banco manda. Mas é esse arquivo que segura o blog se o
 * Supabase estiver fora no próximo build, então vale saber que envelheceu.
 */
function avisarDivergencias(json, supabasePosts) {
  const noBanco = new Map(supabasePosts.map((post) => [post.slug, post]));

  const divergentes = json.filter((post) => {
    const remoto = noBanco.get(post.slug);
    return remoto && Boolean(remoto.isPublished) !== Boolean(post.isPublished);
  });

  if (divergentes.length === 0) return;

  console.warn(
    `[blog] ${divergentes.length} artigo(s) com estado diferente em content/posts.json ` +
      'e no Supabase. Vale o Supabase; a exportação está velha:'
  );
  divergentes.forEach((post) => {
    const remoto = noBanco.get(post.slug);
    console.warn(
      `[blog]   - ${post.slug}: posts.json diz ` +
        `${post.isPublished ? 'publicado' : 'rascunho'}, banco diz ` +
        `${remoto.isPublished ? 'publicado' : 'rascunho'}`
    );
  });
  console.warn('[blog] Para atualizar: /admin > Blog > "Exportar para o build".');
}

export async function loadPosts(renderer) {
  const [supabase, markdown, json] = await Promise.all([
    fromSupabase(),
    fromMarkdownFiles(renderer),
    fromPostsJson(),
  ]);

  // Inserido do que manda menos para o que manda mais: o último a escrever o
  // mesmo slug é quem fica. Por isso o Supabase entra por último.
  const bySlug = new Map();
  [...json, ...markdown, ...supabase.posts].forEach((post) => {
    if (post?.slug) bySlug.set(post.slug, post);
  });

  const posts = Array.from(bySlug.values()).sort((a, b) =>
    (a.publishedAt || '') < (b.publishedAt || '') ? 1 : -1
  );

  console.log(`[blog] ${posts.length} artigo(s) no total depois de resolver os slugs repetidos.`);

  avisarDivergencias(json, supabase.posts);

  return { posts, supabaseOk: supabase.ok };
}
