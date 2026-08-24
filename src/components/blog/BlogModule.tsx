import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { BlogPost, SiteSettings } from '../../types';
import { applyHead, SITE_URL } from '../../lib/seo';
import { BlogList } from './BlogList';
import { BlogPostView } from './BlogPostView';

interface BlogModuleProps {
  posts: BlogPost[];
  settings: SiteSettings;
  /** Vazio = listagem. Preenchido = artigo em /blog/<slug>. */
  slug: string | null;
  onOpenPost: (post: BlogPost) => void;
  onOpenList: () => void;
  onBackToHome: () => void;
}

/**
 * Decide entre listagem e artigo a partir da URL.
 *
 * Um slug que não existe (link antigo, artigo despublicado) mostra uma página
 * de "não encontrado" com `noindex` — e não a listagem disfarçada. Página
 * inexistente respondendo com conteúdo é o que gera "soft 404" no Search
 * Console e derruba a confiança do domínio inteiro.
 */
export const BlogModule: React.FC<BlogModuleProps> = ({
  posts,
  settings,
  slug,
  onOpenPost,
  onOpenList,
  onBackToHome,
}) => {
  const post = slug ? posts.find((item) => item.slug === slug) : null;
  const notFound = Boolean(slug) && (!post || !post.isPublished);

  useEffect(() => {
    if (!notFound) return;
    applyHead({
      title: 'Artigo não encontrado | Gustavo Ravel',
      description: 'Este artigo não existe ou saiu do ar.',
      canonical: `${SITE_URL}/blog`,
      noindex: true,
    });
  }, [notFound]);

  if (notFound) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-gutter pb-20 pt-32 text-center">
        <h1 className="text-3xl font-extrabold text-on-surface">Este artigo não está mais aqui</h1>
        <p className="text-on-surface-variant">
          O endereço pode ter mudado ou o artigo saiu do ar. Veja os artigos publicados.
        </p>
        <button
          onClick={onOpenList}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Ver todos os artigos</span>
        </button>
      </div>
    );
  }

  if (post) {
    return (
      <BlogPostView
        post={post}
        posts={posts}
        settings={settings}
        onOpenPost={onOpenPost}
        onBackToList={onOpenList}
      />
    );
  }

  return <BlogList posts={posts} onOpenPost={onOpenPost} onBackToHome={onBackToHome} />;
};
