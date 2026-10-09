/**
 * Gera `public/blog-data.json`: os artigos publicados, para o app ler no
 * navegador.
 *
 * Por que isto é necessário:
 *
 * O app React lia os artigos só do localStorage e do Supabase. Como os
 * artigos de verdade estão em `content/posts.json` (e agora também em
 * `content/artigos/*.md`), que só existem no build, o visitante recebia a
 * listagem vazia — e, ao abrir um artigo, o React trocava o HTML estático
 * pela página de "não encontrado", **com noindex**. O Google executa
 * JavaScript, então era isso que ele indexava: o blog se apagava sozinho da
 * busca.
 *
 * Este arquivo fecha esse buraco: é a mesma lista que gerou as páginas
 * estáticas, servida como JSON para o app.
 *
 * Roda ANTES do `vite build` (para o Vite copiar o arquivo de `public/` para
 * `dist/`) e antes do `vite` em desenvolvimento.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadRenderer } from './lib/bundle.mjs';
import { loadPosts } from './lib/load-posts.mjs';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'public', 'blog-data.json');

async function main() {
  const renderer = await loadRenderer();
  const posts = await loadPosts(renderer);

  // Só o que está publicado: rascunho no repositório não vai para o navegador
  // de ninguém.
  const published = renderer.publishedPosts(posts);

  await mkdir(path.dirname(TARGET), { recursive: true });
  await writeFile(
    TARGET,
    JSON.stringify({ generatedAt: new Date().toISOString(), posts: published }),
    'utf8'
  );

  console.log(`[blog] public/blog-data.json com ${published.length} artigo(s) publicado(s).`);
}

main().catch((error) => {
  console.error('[blog] Falha ao gerar blog-data.json:', error);
  process.exitCode = 1;
});
