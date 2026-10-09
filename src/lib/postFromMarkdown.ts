import type { BlogPost } from '../types';
import { estimateReadTime } from './blocks';
import {
  blocksToMarkdown,
  frontmatterList,
  frontmatterString,
  markdownToBlocks,
} from './markdown';
import { deriveExcerpt } from './post';

/**
 * Artigo escrito como arquivo `.md` em `content/artigos/`.
 *
 * É o formato que a automação de escrita produz: o agente abre um Pull
 * Request com um arquivo de texto, que é legível na revisão. Um artigo em
 * blocos (JSON) daria um diff de centenas de linhas impossível de conferir.
 *
 * Função pura, sem DOM e sem acesso a disco — quem lê os arquivos é
 * `scripts/lib/load-posts.mjs`.
 */

/** Campos aceitos no bloco `---` do topo do arquivo. */
export interface ArticleFrontmatter {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  keyword?: string;
  date?: string;
  updated?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  slug?: string;
  status?: string;
  noindex?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function safeDate(value: string, fallback: string): string {
  return ISO_DATE.test(value.trim()) ? value.trim() : fallback;
}

/**
 * Converte o conteúdo de um `.md` em artigo.
 *
 * `fallbackSlug` vem do nome do arquivo e só é usado quando o frontmatter não
 * traz `slug`. O slug é o endereço permanente do artigo: uma vez publicado,
 * renomear o arquivo quebra os links já compartilhados e descarta o histórico
 * que ele acumulou na busca. Por isso o ideal é fixar `slug:` no frontmatter.
 */
export function postFromMarkdown(markdown: string, fallbackSlug: string): BlogPost {
  const { blocks, title, frontmatter } = markdownToBlocks(markdown);

  const slug = (frontmatterString(frontmatter, 'slug') || fallbackSlug).trim();
  const publishedAt = safeDate(
    frontmatterString(frontmatter, 'date'),
    new Date().toISOString().slice(0, 10)
  );

  const status = frontmatterString(frontmatter, 'status').toLowerCase();
  const noindex = frontmatterString(frontmatter, 'noindex').toLowerCase();

  return {
    // Estável entre builds: o id é chave de lista no React e identifica a
    // linha no Supabase. Se mudasse a cada build, cada publicação viraria um
    // artigo "novo".
    id: `md-${slug}`,
    title: (title || frontmatterString(frontmatter, 'title') || 'Artigo sem título').trim(),
    slug,
    excerpt:
      frontmatterString(frontmatter, 'description').trim() || deriveExcerpt(blocks),
    content: blocksToMarkdown(blocks),
    blocks,
    category: frontmatterString(frontmatter, 'category').trim() || 'Atendimento',
    tags: frontmatterList(frontmatter, 'tags'),
    readTime: estimateReadTime(blocks),
    publishedAt,
    // Sem `updated` no arquivo, a data de modificação é a de publicação. Não
    // use "hoje": isso faria todo build anunciar ao Google que o artigo
    // inteiro mudou, e a data de modificação perderia qualquer sentido.
    updatedAt: safeDate(frontmatterString(frontmatter, 'updated'), publishedAt),
    author: frontmatterString(frontmatter, 'author').trim() || 'Gustavo Ravel',
    featuredImage: frontmatterString(frontmatter, 'image').trim(),
    featuredImageAlt: frontmatterString(frontmatter, 'imageAlt').trim(),
    seo: {
      focusKeyword: frontmatterString(frontmatter, 'keyword').trim() || undefined,
      noindex: noindex === 'true' || noindex === 'sim',
    },
    // O arquivo só existe no repositório depois de um Pull Request aprovado —
    // a revisão JÁ aconteceu. Por isso o padrão é publicado. Para deixar um
    // artigo parado no repositório sem ir ao ar, use `status: rascunho`.
    isPublished: status !== 'rascunho' && status !== 'draft',
  };
}
