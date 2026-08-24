import type { BlogPost } from '../types';
import type { Block } from '../types.blocks';
import {
  buildTableOfContents,
  headingAnchor,
  isEmptyBlock,
  videoThumbnail,
  videoWatchUrl,
} from './blocks';
import { escapeHtml, inlineToHtml, sanitizeHref, sanitizeSrc } from './markdown';
import { formatDate, postBlocks, publishedPosts, relatedPosts } from './post';
import {
  blogListHead,
  metaDescriptionFor,
  postHead,
  postUrl,
  SITE_NAME,
  SITE_URL,
  type HeadConfig,
} from './seo';

/**
 * Geração das páginas estáticas do blog (roda no build, no Node).
 *
 * Por que isto existe, já que o site é um app React:
 *
 * - WhatsApp, Facebook, LinkedIn e Telegram leem o HTML sem executar
 *   JavaScript. Num app React puro eles só encontram as meta tags do
 *   index.html, então TODO link de artigo compartilhado mostra a prévia da
 *   home. Para este público, que vive no WhatsApp, isso é o canal principal.
 * - O Google executa JavaScript, mas indexa antes e melhor o que já vem
 *   pronto no HTML.
 *
 * O HTML daqui espelha `BlockRenderer.tsx`. Ao mudar um, mude o outro.
 */

function attr(value: string): string {
  return escapeHtml(value);
}

function renderBlock(block: Block, post: BlogPost): string {
  switch (block.type) {
    case 'paragraph':
      return `<p class="my-5 text-[1.05rem] leading-[1.75] text-on-surface">${inlineToHtml(block.text)}</p>`;

    case 'heading': {
      const id = block.anchor || headingAnchor(block.text, block.id);
      const sizes = {
        2: 'mt-12 mb-4 text-2xl md:text-3xl',
        3: 'mt-9 mb-3 text-xl md:text-2xl',
        4: 'mt-7 mb-2 text-lg',
      } as const;
      return `<h${block.level} id="${attr(id)}" class="scroll-mt-28 font-extrabold text-on-surface ${sizes[block.level]}">${inlineToHtml(block.text)}</h${block.level}>`;
    }

    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const marker = block.ordered
        ? 'list-decimal marker:text-primary marker:font-bold'
        : 'list-disc marker:text-primary';
      const items = block.items
        .filter((item) => item.trim() !== '')
        .map((item) => `<li>${inlineToHtml(item)}</li>`)
        .join('');
      return `<${tag} class="my-5 space-y-2 pl-6 text-[1.05rem] leading-[1.7] text-on-surface ${marker}">${items}</${tag}>`;
    }

    case 'quote':
      return `<blockquote class="my-7 border-l-4 border-primary bg-surface-container-low py-4 pl-5 pr-4 rounded-r-xl"><p class="text-lg italic leading-relaxed text-on-surface">${inlineToHtml(block.text)}</p>${
        block.citation
          ? `<cite class="mt-2 block text-sm not-italic text-on-surface-variant">— ${escapeHtml(block.citation)}</cite>`
          : ''
      }</blockquote>`;

    case 'code':
      return `<pre class="my-6 overflow-x-auto rounded-xl border border-white/10 bg-surface-container-lowest p-4 text-sm"><code class="font-mono text-on-surface">${escapeHtml(block.code)}</code></pre>`;

    case 'image': {
      const src = sanitizeSrc(block.src);
      if (!src) return '';
      return `<figure class="my-8${block.width === 'wide' ? ' md:-mx-12' : ''}"><img src="${attr(src)}" alt="${attr(block.alt)}" loading="lazy" decoding="async" class="w-full rounded-2xl border border-white/10">${
        block.caption
          ? `<figcaption class="mt-3 text-center text-sm text-on-surface-variant">${escapeHtml(block.caption)}</figcaption>`
          : ''
      }</figure>`;
    }

    case 'video': {
      // Sem JavaScript o visitante ainda precisa chegar ao vídeo: capa +
      // link para a página do vídeo. Com JavaScript, o React troca isto pelo
      // player embutido.
      const thumb = videoThumbnail(block);
      const watch = videoWatchUrl(block);
      const label = block.title || 'Assistir ao vídeo';
      return `<figure class="my-8"><a href="${attr(watch)}" target="_blank" rel="noopener noreferrer" class="relative block overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video">${
        thumb
          ? `<img src="${attr(thumb)}" alt="${attr(label)}" loading="lazy" decoding="async" class="h-full w-full object-cover opacity-80">`
          : ''
      }<span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-base font-bold text-white">${escapeHtml(label)}</span></a>${
        block.caption
          ? `<figcaption class="mt-3 text-center text-sm text-on-surface-variant">${escapeHtml(block.caption)}</figcaption>`
          : ''
      }</figure>`;
    }

    case 'callout': {
      const tones = {
        info: 'border-primary/40 bg-primary/10 text-primary',
        warning: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
        success: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
      } as const;
      const [border, background, accent] = tones[block.tone].split(' ');
      return `<aside class="my-7 rounded-2xl border p-5 ${border} ${background}">${
        block.title ? `<p class="mb-1 font-bold ${accent}">${inlineToHtml(block.title)}</p>` : ''
      }<p class="leading-relaxed text-on-surface">${inlineToHtml(block.text)}</p></aside>`;
    }

    case 'divider':
      return '<hr class="my-10 border-white/10">';

    case 'cta': {
      const message = encodeURIComponent(
        block.whatsappMessage ||
          `Olá Gustavo! Li o artigo "${post.title}" no seu blog e quero isso funcionando no meu negócio.`
      );
      return `<aside class="my-9 rounded-2xl border border-primary/30 bg-surface-container-high p-6"><h3 class="text-lg font-bold text-on-surface">${escapeHtml(block.title)}</h3>${
        block.text
          ? `<p class="mt-2 text-sm leading-relaxed text-on-surface-variant">${inlineToHtml(block.text)}</p>`
          : ''
      }<a href="https://wa.me/?text=${message}" class="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary">${escapeHtml(block.buttonText)}</a></aside>`;
    }

    case 'table': {
      const head = block.header
        .map(
          (cell) =>
            `<th scope="col" class="border-b border-white/10 bg-surface-container-low px-4 py-3 font-bold text-on-surface">${inlineToHtml(cell)}</th>`
        )
        .join('');
      const body = block.rows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (cell) =>
                  `<td class="border-b border-white/5 px-4 py-3 align-top text-on-surface-variant">${inlineToHtml(cell)}</td>`
              )
              .join('')}</tr>`
        )
        .join('');
      return `<div class="my-7 overflow-x-auto rounded-xl border border-white/10"><table class="w-full border-collapse text-left text-sm"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    }

    case 'faq':
      return `<section class="my-9 space-y-3">${block.items
        .filter((item) => item.question.trim() !== '')
        .map(
          (item) =>
            `<details class="rounded-xl border border-white/10 bg-surface-container-low p-4"><summary class="cursor-pointer font-bold text-on-surface">${inlineToHtml(item.question)}</summary><p class="mt-3 leading-relaxed text-on-surface-variant">${inlineToHtml(item.answer)}</p></details>`
        )
        .join('')}</section>`;
  }
}

export function renderBlocks(blocks: Block[], post: BlogPost): string {
  return blocks
    .filter((block) => !isEmptyBlock(block))
    .map((block) => renderBlock(block, post))
    .join('\n');
}

/** Corpo do artigo, com trilha de navegação, índice e artigos relacionados. */
export function renderPostBody(post: BlogPost, allPosts: BlogPost[]): string {
  const blocks = postBlocks(post);
  const toc = buildTableOfContents(blocks);
  const related = relatedPosts(post, allPosts);

  const tocHtml =
    toc.length >= 3
      ? `<nav aria-label="Neste artigo" class="mt-8 rounded-2xl border border-white/10 bg-surface-container-low p-5"><p class="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Neste artigo</p><ol class="space-y-2 text-sm">${toc
          .map(
            (item) =>
              `<li class="${item.level === 3 ? 'pl-4' : ''}"><a href="#${attr(item.id)}" class="text-on-surface-variant">${escapeHtml(item.text)}</a></li>`
          )
          .join('')}</ol></nav>`
      : '';

  const relatedHtml =
    related.length > 0
      ? `<section class="space-y-4"><h2 class="text-xl font-bold text-on-surface">Continue lendo</h2><div class="grid grid-cols-1 gap-4 md:grid-cols-3">${related
          .map(
            (item) =>
              `<a href="/blog/${attr(item.slug)}" class="glass-panel rounded-2xl border border-white/10 p-5"><span class="text-xs font-bold uppercase text-primary">${escapeHtml(item.category)}</span><h3 class="mt-2 font-bold leading-snug text-on-surface">${escapeHtml(item.title)}</h3></a>`
          )
          .join('')}</div></section>`
      : '';

  return `<div class="mx-auto min-h-screen max-w-[900px] space-y-8 px-gutter pb-20 pt-28">
  <nav aria-label="Você está aqui" class="text-xs text-on-surface-variant"><ol class="flex flex-wrap items-center gap-2"><li><a href="/">Início</a></li><li>›</li><li><a href="/blog">Blog</a></li><li>›</li><li aria-current="page" class="text-on-surface">${escapeHtml(post.category)}</li></ol></nav>
  <article class="glass-panel rounded-3xl border border-white/10 p-6 md:p-12">
    <header class="space-y-4">
      <div class="flex flex-wrap items-center gap-3 font-mono text-xs text-on-surface-variant"><span class="rounded-full bg-primary/20 px-3 py-1 font-bold uppercase text-primary">${escapeHtml(post.category)}</span><span>${escapeHtml(post.readTime)} de leitura</span><time datetime="${attr(post.publishedAt)}">${escapeHtml(formatDate(post.publishedAt))}</time></div>
      <h1 class="text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">${escapeHtml(post.title)}</h1>
      <p class="text-lg leading-relaxed text-on-surface-variant">${escapeHtml(post.excerpt)}</p>
      <p class="border-y border-white/10 py-4 text-xs text-on-surface-variant">Escrito por ${escapeHtml(post.author)}</p>
    </header>
    ${
      post.featuredImage
        ? `<figure class="mt-8"><img src="${attr(post.featuredImage)}" alt="${attr(post.featuredImageAlt || post.title)}" class="w-full rounded-2xl border border-white/10"></figure>`
        : ''
    }
    ${tocHtml}
    <div class="mt-6">${renderBlocks(blocks, post)}</div>
    ${
      (post.tags || []).length > 0
        ? `<div class="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">${(post.tags || [])
            .map(
              (tag) =>
                `<span class="rounded-full border border-white/10 px-3 py-1 text-xs text-on-surface-variant">${escapeHtml(tag)}</span>`
            )
            .join('')}</div>`
        : ''
    }
  </article>
  ${relatedHtml}
</div>`;
}

/** Corpo da listagem /blog. */
export function renderBlogListBody(posts: BlogPost[]): string {
  const live = publishedPosts(posts);
  const cards = live
    .map(
      (post) =>
        `<article class="glass-panel flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10">${
          post.featuredImage
            ? `<img src="${attr(post.featuredImage)}" alt="${attr(post.featuredImageAlt || '')}" loading="lazy" class="h-44 w-full object-cover">`
            : ''
        }<div class="space-y-4 p-6"><span class="rounded bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase text-primary">${escapeHtml(post.category)}</span><h2 class="text-xl font-bold leading-snug text-on-surface"><a href="/blog/${attr(post.slug)}">${escapeHtml(post.title)}</a></h2><p class="text-sm leading-relaxed text-on-surface-variant">${escapeHtml(post.excerpt)}</p><p class="text-xs text-on-surface-variant">${escapeHtml(post.author)} · <time datetime="${attr(post.publishedAt)}">${escapeHtml(formatDate(post.publishedAt))}</time> · ${escapeHtml(post.readTime)}</p></div></article>`
    )
    .join('');

  return `<div class="mx-auto min-h-screen max-w-[1200px] space-y-12 px-gutter pb-20 pt-28">
  <header class="mx-auto max-w-3xl space-y-4 text-center">
    <h1 class="text-3xl font-extrabold text-on-surface md:text-5xl">Dicas para organizar seu atendimento</h1>
    <p class="text-lg leading-relaxed text-on-surface-variant">Coisas simples que você mesmo pode fazer no seu WhatsApp e na sua agenda, explicadas sem termos difíceis.</p>
  </header>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-3">${cards}</div>
</div>`;
}

/** Bloco <head> completo, no mesmo formato que `applyHead` produz no cliente. */
export function renderHead(config: HeadConfig): string {
  const image = config.image || `${SITE_URL}/og-image.jpg`;
  const tags = [
    `<title>${escapeHtml(config.title)}</title>`,
    `<meta name="description" content="${attr(config.description)}">`,
    `<meta name="robots" content="${config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${attr(config.canonical)}">`,
    `<meta property="og:type" content="${config.type || 'website'}">`,
    `<meta property="og:title" content="${attr(config.title)}">`,
    `<meta property="og:description" content="${attr(config.description)}">`,
    `<meta property="og:url" content="${attr(config.canonical)}">`,
    `<meta property="og:image" content="${attr(image)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:site_name" content="${attr(SITE_NAME)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${attr(config.title)}">`,
    `<meta name="twitter:description" content="${attr(config.description)}">`,
    `<meta name="twitter:image" content="${attr(image)}">`,
  ];

  if (config.type === 'article') {
    if (config.publishedTime)
      tags.push(`<meta property="article:published_time" content="${attr(config.publishedTime)}">`);
    if (config.modifiedTime)
      tags.push(`<meta property="article:modified_time" content="${attr(config.modifiedTime)}">`);
    if (config.author) tags.push(`<meta property="article:author" content="${attr(config.author)}">`);
    if (config.section) tags.push(`<meta property="article:section" content="${attr(config.section)}">`);
    (config.tags || []).forEach((tag) =>
      tags.push(`<meta property="article:tag" content="${attr(tag)}">`)
    );
  }

  (config.jsonLd || []).filter(Boolean).forEach((schema) => {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(schema).replace(/<\//g, '<\\/')}</script>`
    );
  });

  return tags.join('\n    ');
}

export interface StaticPage {
  /** Caminho relativo dentro de dist (ex.: 'blog/meu-artigo/index.html'). */
  path: string;
  head: string;
  body: string;
  /** Entrada correspondente no sitemap. */
  url: string;
  lastmod: string;
  priority: string;
}

export function buildStaticPages(posts: BlogPost[]): StaticPage[] {
  const live = publishedPosts(posts).filter((post) => !post.seo?.noindex);

  const pages: StaticPage[] = [
    {
      path: 'blog/index.html',
      head: renderHead(blogListHead(live)),
      body: renderBlogListBody(live),
      url: `${SITE_URL}/blog`,
      lastmod: (live[0]?.updatedAt || live[0]?.publishedAt || new Date().toISOString()).slice(0, 10),
      priority: '0.8',
    },
  ];

  live.forEach((post) => {
    pages.push({
      path: `blog/${post.slug}/index.html`,
      head: renderHead(postHead(post, postBlocks(post))),
      body: renderPostBody(post, live),
      url: postUrl(post.slug),
      lastmod: (post.updatedAt || post.publishedAt).slice(0, 10),
      priority: '0.7',
    });
  });

  return pages;
}

/** sitemap.xml com a home, as páginas fixas e todos os artigos publicados. */
export function buildSitemap(posts: BlogPost[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    { url: `${SITE_URL}/`, lastmod: today, priority: '1.0', changefreq: 'weekly' },
    { url: `${SITE_URL}/privacidade`, lastmod: today, priority: '0.3', changefreq: 'yearly' },
    { url: `${SITE_URL}/termos`, lastmod: today, priority: '0.3', changefreq: 'yearly' },
    ...buildStaticPages(posts).map((page) => ({
      url: page.url,
      lastmod: page.lastmod,
      priority: page.priority,
      changefreq: 'monthly',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `  <url>\n    <loc>${entry.url}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;
}

/** RSS: leitores e agregadores acompanham o blog sem depender da busca. */
export function buildRssFeed(posts: BlogPost[]): string {
  const live = publishedPosts(posts).filter((post) => !post.seo?.noindex).slice(0, 20);

  const items = live
    .map((post) => {
      const description = metaDescriptionFor(post, postBlocks(post));
      return `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${postUrl(post.slug)}</link>
      <guid isPermaLink="true">${postUrl(post.slug)}</guid>
      <pubDate>${new Date(`${post.publishedAt}T09:00:00-03:00`).toUTCString()}</pubDate>
      <category>${escapeHtml(post.category)}</category>
      <description>${escapeHtml(description)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(SITE_NAME)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Dicas para organizar o atendimento do seu negócio.</description>
    <language>pt-BR</language>
${items}
  </channel>
</rss>
`;
}

/** Links para os sanitizadores continuarem exportados a quem gerar HTML avulso. */
export { sanitizeHref };
