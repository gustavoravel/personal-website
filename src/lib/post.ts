import type { BlogPost } from '../types';
import type { Block } from '../types.blocks';
import { blocksToPlainText, estimateReadTime, slugify, stripInline } from './blocks';
import { blocksToMarkdown, markdownToBlocks } from './markdown';

/**
 * Ponte entre o artigo salvo e o modelo de blocos.
 *
 * Artigos criados antes do editor de blocos só têm `content` (Markdown).
 * Em vez de exigir uma migração manual, eles são convertidos na leitura —
 * e regravados como blocos na primeira vez que forem abertos no editor.
 */

const cache = new Map<string, { source: string; blocks: Block[] }>();

/** Blocos do artigo. Converte do Markdown antigo quando não houver blocos. */
export function postBlocks(post: BlogPost): Block[] {
  if (post.blocks && post.blocks.length > 0) return post.blocks;

  const source = post.content || '';
  const cached = cache.get(post.id);
  if (cached && cached.source === source) return cached.blocks;

  const { blocks } = markdownToBlocks(source);
  cache.set(post.id, { source, blocks });
  return blocks;
}

/** Resumo automático quando o autor não escreveu um. */
export function deriveExcerpt(blocks: Block[], limit = 180): string {
  const text = stripInline(blocksToPlainText(blocks)).replace(/\s+/g, ' ');
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 120 ? lastSpace : limit).trim()}…`;
}

/**
 * Slug único dentro do blog.
 *
 * Slug é endereço permanente: mudar o de um artigo já publicado descarta o
 * histórico que ele acumulou na busca. Por isso o editor só sugere o slug
 * enquanto o artigo é rascunho.
 */
export function uniqueSlug(title: string, posts: BlogPost[], currentId?: string): string {
  const base = slugify(title) || 'artigo';
  const taken = new Set(posts.filter((p) => p.id !== currentId).map((p) => p.slug));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/** Preenche o que faltar e mantém `content` (Markdown) em dia com os blocos. */
export function normalizePost(
  draft: Partial<BlogPost>,
  blocks: Block[],
  existing: BlogPost[]
): BlogPost {
  const title = (draft.title || '').trim() || 'Artigo sem título';
  const today = new Date().toISOString().split('T')[0];

  return {
    id: draft.id || `post-${Date.now()}`,
    title,
    slug: (draft.slug || '').trim() || uniqueSlug(title, existing, draft.id),
    excerpt: (draft.excerpt || '').trim() || deriveExcerpt(blocks),
    content: blocksToMarkdown(blocks),
    blocks,
    category: (draft.category || '').trim() || 'Geral',
    tags: (draft.tags || []).map((t) => t.trim()).filter(Boolean),
    readTime: estimateReadTime(blocks),
    publishedAt: draft.publishedAt || today,
    updatedAt: today,
    author: (draft.author || '').trim() || 'Gustavo Ravel',
    featuredImage: draft.featuredImage || '',
    featuredImageAlt: draft.featuredImageAlt || '',
    seo: draft.seo || {},
    isPublished: draft.isPublished ?? false,
  };
}

/** Artigos visíveis ao público, do mais recente para o mais antigo. */
export function publishedPosts(posts: BlogPost[]): BlogPost[] {
  return posts
    .filter((post) => post.isPublished)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/**
 * Artigos relacionados: mesma categoria primeiro, depois quem compartilha tag.
 * Link interno entre artigos é o que faz o buscador percorrer o blog inteiro
 * em vez de indexar só o mais recente.
 */
export function relatedPosts(post: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const others = publishedPosts(posts).filter((p) => p.id !== post.id);
  const tags = new Set(post.tags || []);

  const score = (candidate: BlogPost) => {
    let value = candidate.category === post.category ? 2 : 0;
    value += (candidate.tags || []).filter((tag) => tags.has(tag)).length;
    return value;
  };

  return others
    .map((candidate) => ({ candidate, value: score(candidate) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function formatDate(value: string): string {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
