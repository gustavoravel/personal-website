import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Search, Tag } from 'lucide-react';
import type { BlogPost } from '../../types';
import { applyHead, blogListHead } from '../../lib/seo';
import { formatDate, publishedPosts } from '../../lib/post';

interface BlogListProps {
  posts: BlogPost[];
  onOpenPost: (post: BlogPost) => void;
  onBackToHome: () => void;
}

export const BlogList: React.FC<BlogListProps> = ({ posts, onOpenPost, onBackToHome }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const live = useMemo(() => publishedPosts(posts), [posts]);

  useEffect(() => {
    applyHead(blogListHead(live));
  }, [live]);

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(live.map((p) => p.category)))],
    [live]
  );

  const tags = useMemo(
    () => Array.from(new Set(live.flatMap((p) => p.tags || []))).slice(0, 12),
    [live]
  );

  const filtered = live.filter((post) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesTag = !selectedTag || (post.tags || []).includes(selectedTag);
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      (post.tags || []).some((tag) => tag.toLowerCase().includes(query));
    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] space-y-12 px-gutter pb-20 pt-28">
      <button
        onClick={onBackToHome}
        className="glass-panel inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:border-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao início</span>
      </button>

      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm font-bold uppercase tracking-widest text-primary">
          <BookOpen className="h-4 w-4" />
          <span>Dicas práticas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface md:text-5xl">
          Dicas para <span className="text-primary">organizar seu atendimento</span>
        </h1>
        <p className="text-lg leading-relaxed text-on-surface-variant">
          Coisas simples que você mesmo pode fazer no seu WhatsApp e na sua agenda, explicadas sem
          termos difíceis.
        </p>
      </header>

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-surface-container-low p-4 md:flex-row">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'glass-panel text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-on-surface-variant" />
          <label className="sr-only" htmlFor="blog-search">
            Buscar artigos
          </label>
          <input
            id="blog-search"
            type="search"
            placeholder="Buscar artigos..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-container py-2.5 pl-9 pr-4 text-xs text-on-surface focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden="true" />
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                selectedTag === tag
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-white/10 text-on-surface-variant hover:border-primary/40'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {filtered.map((post) => (
          <article
            key={post.id}
            className="glass-panel group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-primary"
          >
            {post.featuredImage && (
              <a
                href={`/blog/${post.slug}`}
                onClick={(event) => {
                  event.preventDefault();
                  onOpenPost(post);
                }}
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || ''}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full object-cover"
                />
              </a>
            )}

            <div className="flex flex-1 flex-col justify-between space-y-6 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
                  <span className="rounded bg-primary/10 px-2.5 py-1 font-bold uppercase text-primary">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
                  {/* Link real (<a href>) e não só onClick: é o que o buscador
                      segue para descobrir o artigo, e o que permite ao leitor
                      abrir em nova aba. */}
                  <a
                    href={`/blog/${post.slug}`}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                      event.preventDefault();
                      onOpenPost(post);
                    }}
                    className="focus-visible:underline"
                  >
                    {post.title}
                  </a>
                </h2>

                <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-on-surface-variant">
                <span>{post.author}</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-on-surface-variant">
          {live.length === 0
            ? 'Os primeiros artigos estão sendo escritos. Volte em breve.'
            : 'Nenhum artigo encontrado para essa busca.'}
        </p>
      )}
    </div>
  );
};
