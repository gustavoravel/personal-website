import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '../types';
import { applyHead, SITE_URL } from '../lib/seo';
import { openWhatsApp } from '../lib/contact';

interface NotFoundPageProps {
  settings: SiteSettings;
  onBackToHome: () => void;
  onOpenBlog: () => void;
}

/**
 * Página de endereço não encontrado.
 *
 * Duas decisões que importam:
 *
 * - `noindex`: a página não existe, então não deve entrar na busca. Sem isso
 *   o Google indexaria endereços errados e eles apareceriam nos resultados.
 * - Caminhos de saída em vez de um beco: quem chegou aqui veio de um link
 *   quebrado, talvez de um cartão ou de uma mensagem antiga. Oferecer o blog,
 *   a home e o WhatsApp é a diferença entre perder e recuperar esse contato.
 */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  settings,
  onBackToHome,
  onOpenBlog,
}) => {
  useEffect(() => {
    applyHead({
      title: 'Página não encontrada | Gustavo Ravel',
      description: 'Este endereço não existe ou mudou de lugar.',
      canonical: `${SITE_URL}/`,
      noindex: true,
    });
  }, []);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-6 px-gutter pb-20 pt-32 text-center">
      <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
        Erro 404
      </p>

      <h1 className="text-3xl font-extrabold text-on-surface md:text-4xl">
        Esta página não existe
      </h1>

      <p className="text-lg leading-relaxed text-on-surface-variant">
        O endereço pode ter sido digitado com algum caractere trocado, ou o link que você clicou
        está desatualizado. Nada de errado do seu lado.
      </p>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Ir para o início</span>
        </button>

        <button
          type="button"
          onClick={onOpenBlog}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline px-6 py-3.5 text-sm font-bold text-on-surface transition-colors hover:bg-white/5"
        >
          <BookOpen className="h-4 w-4" />
          <span>Ver as dicas</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => openWhatsApp(settings, 'Olá Gustavo! Caí numa página que não existe no seu site.')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-emerald-400"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Procurando algo específico? Me chame no WhatsApp</span>
      </button>
    </div>
  );
};
