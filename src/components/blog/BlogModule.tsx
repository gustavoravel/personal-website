import React, { useState } from 'react';
import { BlogPost, SiteSettings } from '../../types';
import { BookOpen, Search, Clock, ArrowLeft, Share2, Tag, Calendar, User, MessageCircle } from 'lucide-react';

interface BlogModuleProps {
  posts: BlogPost[];
  settings: SiteSettings;
  onBackToHome: () => void;
}

export const BlogModule: React.FC<BlogModuleProps> = ({ posts, settings, onBackToHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = ['Todos', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && post.isPublished;
  });

  const handleSharePost = (post: BlogPost) => {
    const text = encodeURIComponent(`Li este excelente artigo no site do Gustavo Ravel: "${post.title}"!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="pt-28 pb-20 px-gutter max-w-[1200px] mx-auto min-h-screen space-y-12">
      {/* Back button */}
      <button
        onClick={onBackToHome}
        className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider glass-panel px-4 py-2 rounded-lg hover:border-primary transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Inicio</span>
      </button>

      {!selectedPost ? (
        <>
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
              <BookOpen className="w-4 h-4" />
              <span>Dicas Práticas</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface">
              Dicas para <span className="text-primary">organizar seu atendimento</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Coisas simples que você mesmo pode fazer no seu WhatsApp e na sua agenda, explicadas sem termos difíceis.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-white/10">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                      : 'glass-panel text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container pl-9 pr-4 py-2.5 rounded-lg border border-white/10 text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-primary transition-all duration-300 flex flex-col justify-between cursor-pointer group space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono text-on-surface-variant">
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded font-bold uppercase">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{post.author}</span>
                  </div>
                  <span>{post.publishedAt}</span>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              Nenhum artigo encontrado para a busca especificada.
            </div>
          )}
        </>
      ) : (
        /* Detailed Post Article Reader View */
        <div className="max-w-3xl mx-auto glass-panel p-8 md:p-12 rounded-3xl border border-white/10 space-y-8">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline mb-4"
          >
            ← Voltar para a Lista de Artigos
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase">
                {selectedPost.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedPost.readTime} de leitura
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedPost.publishedAt}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex items-center justify-between py-4 border-y border-white/10 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2 font-semibold">
                <User className="w-4 h-4 text-primary" />
                <span>Escrito por: {selectedPost.author}</span>
              </div>

              <button
                onClick={() => handleSharePost(selectedPost)}
                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar no WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Article Markdown Content Body */}
          <div className="prose prose-invert max-w-none text-on-surface leading-relaxed space-y-4 text-sm md:text-base whitespace-pre-line">
            {selectedPost.content}
          </div>

          {/* Article CTA Banner */}
          <div className="bg-surface-container-high p-6 rounded-2xl border border-primary/30 space-y-3 pt-6">
            <h3 className="text-lg font-bold text-on-surface">Quer implementar essa solução no seu próprio negócio?</h3>
            <p className="text-xs text-on-surface-variant">
              Fale diretamente com Gustavo Ravel e receba o pacote configurado em até 7 dias.
            </p>
            <button
              onClick={() => {
                const text = encodeURIComponent(`Olá Gustavo! Li o artigo "${selectedPost.title}" no seu blog e quero implementar essa solução!`);
                window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
              }}
              className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg text-xs hover:scale-105 transition-transform flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar Gustavo no WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
