import type { BlogPost, SiteSettings } from '../types';
import type { Block } from '../types.blocks';
import {
  blocksToPlainText,
  isoDuration,
  stripInline,
  videoThumbnail,
  videoWatchUrl,
} from './blocks';

/**
 * SEO do blog.
 *
 * Duas camadas, porque uma só não resolve:
 *
 * 1. `applyHead` reescreve as meta tags no cliente. É o que o Google usa
 *    (ele executa JavaScript) e o que mantém o título da aba correto ao
 *    navegar entre artigos.
 * 2. `scripts/generate-blog-static.mjs` gera um HTML estático por artigo no
 *    build. É o que WhatsApp, Facebook e LinkedIn usam — esses NUNCA executam
 *    JavaScript, então sem o HTML estático o link colado no WhatsApp mostra a
 *    prévia da home em vez da prévia do artigo.
 *
 * Os construtores de JSON-LD daqui são puros (sem DOM) porque o script de
 * build também os usa.
 */

export const SITE_URL = 'https://gustavoravel.com.br';
export const SITE_NAME = 'Gustavo Ravel — Tecnologia Sem Complicação';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** URL pública e definitiva de um artigo. Uma só função para não divergir. */
export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function absoluteUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Data em ISO para os schemas; aceita 'YYYY-MM-DD' ou ISO completo. */
export function toIsoDate(value?: string): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T09:00:00-03:00` : value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/**
 * Descrição do resultado de busca.
 * Corta em 155 caracteres: acima disso o Google trunca com "…" e a frase
 * perde o final, que costuma ser onde está a promessa.
 */
export function metaDescriptionFor(post: BlogPost, blocks: Block[]): string {
  const explicit = post.seo?.metaDescription?.trim();
  if (explicit) return explicit;

  const source = post.excerpt?.trim() || blocksToPlainText(blocks);
  const clean = stripInline(source).replace(/\s+/g, ' ');
  if (clean.length <= 155) return clean;
  const cut = clean.slice(0, 155);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 100 ? lastSpace : 155).trim()}…`;
}

export function metaTitleFor(post: BlogPost): string {
  const explicit = post.seo?.metaTitle?.trim();
  if (explicit) return explicit;
  // ~60 caracteres é o que cabe no resultado do Google antes de cortar.
  const suffix = ' | Gustavo Ravel';
  return post.title.length + suffix.length <= 60 ? `${post.title}${suffix}` : post.title;
}

export function ogImageFor(post: BlogPost): string {
  return absoluteUrl(post.seo?.ogImage || post.featuredImage || DEFAULT_OG_IMAGE);
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

export function authorSchema(name: string) {
  return {
    '@type': 'Person',
    name: name || 'Gustavo Ravel',
    url: `${SITE_URL}/#sobre`,
  };
}

export function publisherSchema() {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.svg`,
    },
  };
}

/** BlogPosting: o schema que faz o artigo aparecer como artigo, não como página solta. */
export function articleSchema(post: BlogPost, blocks: Block[]) {
  const description = metaDescriptionFor(post, blocks);
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl(post.slug) },
    headline: post.title.slice(0, 110),
    description,
    image: [ogImageFor(post)],
    datePublished: toIsoDate(post.publishedAt),
    dateModified: toIsoDate(post.updatedAt || post.publishedAt),
    author: authorSchema(post.author),
    publisher: publisherSchema(),
    inLanguage: 'pt-BR',
    articleSection: post.category,
    keywords: [post.seo?.focusKeyword, ...(post.tags || [])].filter(Boolean).join(', '),
    wordCount: words,
  };
}

/** Um VideoObject por vídeo incorporado — é assim que o vídeo entra na busca. */
export function videoSchemas(post: BlogPost, blocks: Block[]) {
  return blocks
    .filter((b): b is Extract<Block, { type: 'video' }> => b.type === 'video' && Boolean(b.url))
    .map((block) => {
      const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: block.title || post.title,
        description: block.description || block.caption || metaDescriptionFor(post, blocks),
        uploadDate: toIsoDate(block.uploadDate || post.publishedAt),
        contentUrl: videoWatchUrl(block),
        embedUrl: videoWatchUrl(block),
        inLanguage: 'pt-BR',
      };

      const thumb = videoThumbnail(block);
      if (thumb) schema.thumbnailUrl = [thumb];

      const duration = isoDuration(block.durationSeconds);
      if (duration) schema.duration = duration;

      return schema;
    });
}

/** FAQPage: os blocos de perguntas frequentes podem virar resultado expandido. */
export function faqSchema(blocks: Block[]) {
  const items = blocks
    .filter((b): b is Extract<Block, { type: 'faq' }> => b.type === 'faq')
    .flatMap((b) => b.items)
    .filter((i) => i.question.trim() && i.answer.trim());

  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: stripInline(item.question),
      acceptedAnswer: { '@type': 'Answer', text: stripInline(item.answer) },
    })),
  };
}

/** Trilha de navegação — dá ao Google o caminho Início › Blog › Artigo. */
export function breadcrumbSchema(post?: BlogPost) {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
  ];

  if (post) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: postUrl(post.slug),
    });
  }

  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

/** Página de listagem do blog. */
export function blogSchema(posts: BlogPost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog`,
    name: 'Dicas para organizar seu atendimento',
    description:
      'Artigos práticos sobre WhatsApp comercial, agenda online e automação do atendimento para pequenos negócios.',
    url: `${SITE_URL}/blog`,
    inLanguage: 'pt-BR',
    publisher: publisherSchema(),
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: postUrl(post.slug),
      datePublished: toIsoDate(post.publishedAt),
      author: authorSchema(post.author),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Aplicação no <head> (só no navegador)                               */
/* ------------------------------------------------------------------ */

export interface HeadConfig {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  /** Cada objeto vira uma tag <script type="application/ld+json"> gerenciada. */
  jsonLd?: unknown[];
}

/** Marca as tags que este módulo criou, para poder removê-las na navegação. */
const MANAGED = 'data-seo-managed';

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  if (!content) return;
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    tag.setAttribute(MANAGED, 'true');
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLink(rel: string, href: string): void {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = rel;
    tag.setAttribute(MANAGED, 'true');
    document.head.appendChild(tag);
  }
  tag.href = href;
}

/**
 * Reescreve o <head> para a página atual.
 *
 * As tags do index.html (que descrevem a home) são reaproveitadas e
 * sobrescritas em vez de duplicadas — duas `og:title` na mesma página fazem o
 * WhatsApp escolher a errada.
 */
export function applyHead(config: HeadConfig): void {
  if (typeof document === 'undefined') return;

  document.title = config.title;

  setMeta('name', 'description', config.description);
  setMeta('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  setLink('canonical', config.canonical);

  setMeta('property', 'og:type', config.type || 'website');
  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:url', config.canonical);
  setMeta('property', 'og:image', config.image || DEFAULT_OG_IMAGE);
  setMeta('property', 'og:locale', 'pt_BR');
  setMeta('property', 'og:site_name', SITE_NAME);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);
  setMeta('name', 'twitter:image', config.image || DEFAULT_OG_IMAGE);

  // Tags específicas de artigo: removidas quando a página não é um artigo.
  document.head
    .querySelectorAll('meta[property^="article:"]')
    .forEach((tag) => tag.remove());

  if (config.type === 'article') {
    if (config.publishedTime) setMeta('property', 'article:published_time', config.publishedTime);
    if (config.modifiedTime) setMeta('property', 'article:modified_time', config.modifiedTime);
    if (config.author) setMeta('property', 'article:author', config.author);
    if (config.section) setMeta('property', 'article:section', config.section);
    (config.tags || []).forEach((tag) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'article:tag');
      meta.setAttribute('content', tag);
      meta.setAttribute(MANAGED, 'true');
      document.head.appendChild(meta);
    });
  }

  applyJsonLd(config.jsonLd || []);
}

function applyJsonLd(schemas: unknown[]): void {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${MANAGED}]`)
    .forEach((tag) => tag.remove());

  schemas.filter(Boolean).forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(MANAGED, 'true');
    // JSON.stringify já escapa o conteúdo; `</script>` dentro de string é o
    // único caso que quebraria o parser do HTML.
    script.textContent = JSON.stringify(schema).replace(/<\//g, '<\\/');
    document.head.appendChild(script);
  });
}

/** Head completo de um artigo. */
export function postHead(post: BlogPost, blocks: Block[]): HeadConfig {
  return {
    title: metaTitleFor(post),
    description: metaDescriptionFor(post, blocks),
    canonical: post.seo?.canonicalUrl?.trim() || postUrl(post.slug),
    image: ogImageFor(post),
    type: 'article',
    noindex: post.seo?.noindex || !post.isPublished,
    publishedTime: toIsoDate(post.publishedAt),
    modifiedTime: toIsoDate(post.updatedAt || post.publishedAt),
    author: post.author,
    section: post.category,
    tags: post.tags,
    jsonLd: [
      articleSchema(post, blocks),
      breadcrumbSchema(post),
      faqSchema(blocks),
      ...videoSchemas(post, blocks),
    ].filter(Boolean),
  };
}

/** Head da listagem do blog. */
export function blogListHead(posts: BlogPost[]): HeadConfig {
  return {
    title: 'Blog | Dicas para organizar o atendimento do seu negócio',
    description:
      'Artigos curtos e sem termos técnicos sobre WhatsApp comercial, agenda online e automação do atendimento para quem tem um pequeno negócio.',
    canonical: `${SITE_URL}/blog`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
    jsonLd: [blogSchema(posts), breadcrumbSchema()],
  };
}

/** Head da home — restaura o que o index.html declara ao voltar da leitura. */
export function homeHead(settings: SiteSettings): HeadConfig {
  return {
    title: 'Tecnologia Sem Complicação | WhatsApp e agenda online configurados em 7 dias',
    description:
      settings.heroSubheadline ||
      'Organizo seu WhatsApp comercial, coloco sua agenda online no ar e automatizo as tarefas repetitivas do seu atendimento. Pronto em 7 dias, tudo no seu nome.',
    canonical: `${SITE_URL}/`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  };
}
