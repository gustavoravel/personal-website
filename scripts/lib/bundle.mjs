import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { rm } from 'node:fs/promises';
import { build } from 'vite';

/**
 * Compila `src/lib/staticRender.ts` para JavaScript e carrega o módulo.
 *
 * O Node não executa TypeScript, e os scripts de build precisam exatamente da
 * mesma lógica que o site usa (converter Markdown em blocos, montar o HTML do
 * artigo, montar as meta tags). Compilar na hora evita a alternativa ruim:
 * reescrever essa lógica em JavaScript e deixar as duas versões divergirem.
 *
 * Usa a API do Vite, que já é dependência do projeto — nada novo para instalar.
 */

const ROOT = process.cwd();

export async function loadRenderer({ keepCache = false } = {}) {
  const cache = path.join(ROOT, 'node_modules', '.cache', 'blog-render');

  await build({
    configFile: false,
    logLevel: 'error',
    build: {
      ssr: path.join('src', 'lib', 'staticRender.ts'),
      outDir: path.relative(ROOT, cache),
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        output: { entryFileNames: 'staticRender.mjs', format: 'es' },
      },
    },
  });

  const module = await import(pathToFileURL(path.join(cache, 'staticRender.mjs')).href);

  if (!keepCache) {
    // O import já está em memória; o arquivo em disco não é mais necessário.
    await rm(cache, { recursive: true, force: true });
  }

  return module;
}
