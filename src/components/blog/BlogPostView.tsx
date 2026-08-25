import React, { useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, ListTree, Share2, User } from 'lucide-react';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { openWhatsApp as openWhatsAppLink } from '../../lib/contact';
import type { BlogPost, SiteSettings } from '../../types';
import { buildTableOfContents } from '../../lib/blocks';
import { applyHead, postHead } from '../../lib/seo';
import { formatDate, postBlocks, relatedPosts } from '../../lib/post';
import { BlockRenderer } from './BlockRenderer';

interface BlogPostViewProps {
  post: BlogPost;
  posts: BlogPost[];
  settings: SiteSettings;
  onOpenPost: (post: BlogPost) => void;
  onBackToList: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post,
  posts,
  settings,
  onOpenPost,
  onBackToList,
}) => {
  const blocks = useMemo(() => postBlocks(post), [post]);
  const toc = useMemo(() => buildTableOfContents(blocks), [blocks]);
  const related = useMemo(() => relatedPosts(post, posts), [post, posts]);

  useEffect(() => {
    applyHead(postHead(post, blocks));
  }, [post, blocks]);

  // Pelo funil de `lib/contact`: assim o número inválido cai no formulário
  // em vez de abrir um wa.me quebrado, e o clique conta como conversão.
  const openWhatsApp = (message: string, origem: string) => {
    openWhatsAppLink(settings, message, origem);
  };

  const sharePost = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    // Compartilhamento nativo no celular (onde o leitor está); no desktop cai
    // para o WhatsApp Web, que é o canal que este público usa.
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
        return;
      } catch {
        // Cancelado pelo usuário — segue para o WhatsApp.
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-[900px] space-y-8 px-gutter pb-20 pt-28">
      <nav aria-label="Você está aqui" className="text-xs text-on-surface-variant">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a href="/" className="hover:text-primary">
              Início
            </a>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <a
              href="/blog"
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey) return;
                event.preventDefault();
                onBackToList();
              }}
              className="hover:text-primary"
            >
              Blog
            </a>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-on-surface">
            {post.category}
          </li>
        </ol>
      </nav>

      <button
        onClick={onBackToList}
        className="glass-panel inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:border-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Todos os artigos</span>
      </button>

      <article className="glass-panel rounded-3xl border border-white/10 p-6 md:p-12">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-on-surface-variant">
            <span className="rounded-full bg-primary/20 px-3 py-1 font-bold uppercase text-primary">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} de leitura
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </span>
          </div>

          {/* Um único H1 por página, e ele é o título do artigo. */}
          <h1 className="text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
            {post.title}
          </h1>

          <p className="text-lg leading-relaxed text-on-surface-variant">{post.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4 text-primary" />
              Escrito por {post.author}
            </span>

            <button
              onClick={sharePost}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 px-3 py-1.5 font-bold text-emerald-400 transition-colors hover:bg-emerald-600 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>
        </header>

        {post.featuredImage && (
          <figure className="mt-8">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full rounded-2xl border border-white/10"
              loading="eager"
              decoding="async"
              /* A imagem destacada é o maior elemento visível na abertura:
                 priorizar o download melhora o LCP, que conta no
                 ranqueamento. Em minúsculas porque o React 18 ainda não
                 conhece a versão camelCase e a descartaria com um aviso. */
              {...{ fetchpriority: 'high' }}
            />
          </figure>
        )}

        {toc.length >= 3 && (
          <nav
            aria-label="Neste artigo"
            className="mt-8 rounded-2xl border border-white/10 bg-surface-container-low p-5"
          >
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <ListTree className="h-4 w-4" />
              Neste artigo
            </p>
            <ol className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                  <a href={`#${item.id}`} className="text-on-surface-variant hover:text-primary">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-6">
          <BlockRenderer
            blocks={blocks}
            onCtaClick={(block) =>
              openWhatsApp(
                block.whatsappMessage ||
                  `Olá Gustavo! Li o artigo "${post.title}" no seu blog e quero isso funcionando no meu negócio.`,
                'artigo:cta-no-texto'
              )
            }
          />
        </div>

        {(post.tags || []).length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
            {(post.tags || []).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <aside className="mt-10 space-y-3 rounded-2xl border border-primary/30 bg-surface-container-high p-6">
          <h2 className="text-lg font-bold text-on-surface">
            Quer isso funcionando no seu negócio sem ter que aprender nada disso?
          </h2>
          <p className="text-sm text-on-surface-variant">
            Eu configuro tudo no seu nome e entrego pronto em até 7 dias. Se não funcionar como
            combinado, a etapa não é cobrada.
          </p>
          <button
            onClick={() =>
              openWhatsApp(
                `Olá Gustavo! Li o artigo "${post.title}" no seu blog e quero implementar isso no meu negócio.`,
                'artigo:rodape'
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-105"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>Chamar o Gustavo no WhatsApp</span>
          </button>
        </aside>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="space-y-4">
          <h2 id="relacionados" className="text-xl font-bold text-on-surface">
            Continue lendo
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {related.map((item) => (
              <a
                key={item.id}
                href={`/blog/${item.slug}`}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey) return;
                  event.preventDefault();
                  onOpenPost(item);
                }}
                className="glass-panel rounded-2xl border border-white/10 p-5 transition-colors hover:border-primary"
              >
                <span className="text-xs font-bold uppercase text-primary">{item.category}</span>
                <h3 className="mt-2 font-bold leading-snug text-on-surface">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-on-surface-variant">{item.excerpt}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
