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

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadRenderer } from './lib/bundle.mjs';
import { loadPosts } from './lib/load-posts.mjs';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'public', 'blog-data.json');

/**
 * A lista de artigos que já está publicada, para servir de piso.
 *
 * Tenta primeiro o arquivo local (existe em desenvolvimento) e depois o do
 * site no ar. O segundo caso é o que importa: no Netlify cada build parte de
 * um clone limpo, então o arquivo local NÃO existe e sem esta consulta a trava
 * não protegeria nada justamente onde o estrago aconteceria.
 */
async function listaAtual(siteUrl) {
  if (existsSync(TARGET)) {
    try {
      const local = JSON.parse(await readFile(TARGET, 'utf8'));
      if (Array.isArray(local?.posts) && local.posts.length > 0) return local.posts;
    } catch {
      // Ilegível: tenta o site no ar.
    }
  }

  try {
    const response = await fetch(`${siteUrl}/blog-data.json`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    const remoto = await response.json();
    return Array.isArray(remoto?.posts) ? remoto.posts : null;
  } catch {
    // Primeiro deploy, site fora do ar, sem rede: não há piso a respeitar.
    return null;
  }
}

async function main() {
  const renderer = await loadRenderer();
  const { posts, supabaseOk } = await loadPosts(renderer);

  // Só o que está publicado: rascunho no repositório não vai para o navegador
  // de ninguém.
  const published = renderer.publishedPosts(posts);

  // Trava de segurança: não deixar um build publicar MENOS artigos do que já
  // estão no ar quando o banco não respondeu.
  //
  // O caso real: o Supabase do plano gratuito pausa sozinho. Como ele é a
  // origem que manda, um build feito nesse intervalo geraria a lista só com o
  // que está no repositório — e o deploy seguinte tiraria do ar os artigos que
  // só existem no banco. Despublicar de propósito continua funcionando: aí o
  // banco respondeu, e `supabaseOk` é verdadeiro.
  if (!supabaseOk) {
    const anterior = await listaAtual(renderer.SITE_URL);

    if (anterior && anterior.length > published.length) {
      console.warn(
        `[blog] O banco não respondeu e a lista cairia de ${anterior.length} para ` +
          `${published.length} artigo(s). Mantendo a lista que já está no ar.`
      );
      console.warn('[blog] Reative o projeto em https://supabase.com/dashboard e publique de novo.');

      await mkdir(path.dirname(TARGET), { recursive: true });
      await writeFile(
        TARGET,
        JSON.stringify({ generatedAt: new Date().toISOString(), posts: anterior }),
        'utf8'
      );
      return;
    }
  }

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
