import React, { useState } from 'react';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { SiteSettings } from '../types';
import { AppView } from '../App';
import { openWhatsApp, hasWhatsApp } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface NavbarProps {
  setCurrentView: (view: AppView) => void;
  settings: SiteSettings;
  onStartDiagnostic: () => void;
  /** Só entra no menu quando existe artigo publicado (ver comentário abaixo). */
  hasPublishedPosts?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  setCurrentView,
  settings,
  onStartDiagnostic,
  hasPublishedPosts = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // "Blog Tech" saiu do menu: link que não leva a nada é sinal de site
  // abandonado. Volta sozinho quando existe o primeiro artigo publicado —
  // e volta com nome de cliente ("Dicas"), não de blog.
  const navLinks = [
    { label: 'Como funciona', hash: '#como-funciona' },
    { label: 'Preços', hash: '#planos' },
    { label: 'Demonstração', hash: '#cases' },
    { label: 'Quem sou eu', hash: '#sobre' },
    { label: 'Garantia', hash: '#garantia' },
    { label: 'Dúvidas', hash: '#faq' }
  ];

  /**
   * Link para o blog dentro do menu. Além de ser o caminho do visitante, é o
   * que faz o buscador descobrir os artigos: página sem link apontando para
   * ela demora muito mais a ser indexada.
   */
  const blogLink = hasPublishedPosts ? { label: 'Dicas', href: '/blog' } : null;

  const handleBlogClick = (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setMobileMenuOpen(false);
    setCurrentView('blog');
  };

  const handleNavClick = (hash: string) => {
    setCurrentView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="max-w-[1200px] mx-auto px-gutter h-20 flex items-center justify-between gap-4">
        {/* Marca principal em linguagem que o cliente entende.
            "Tech Concierge" saiu: o público leigo não reconhece o termo. */}
        <button
          onClick={() => handleNavClick('#hero')}
          className="flex items-center gap-3 text-left group shrink-0"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-lg leading-none text-on-surface tracking-tight">
              Gustavo Ravel
            </span>
            <span className="text-sm text-primary font-semibold">
              Tecnologia Sem Complicação
            </span>
          </div>
        </button>

        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(link.hash)}
              className="text-base font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
            >
              {link.label}
            </button>
          ))}

          {blogLink && (
            <a
              href={blogLink.href}
              onClick={handleBlogClick}
              className="text-base font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
            >
              {blogLink.label}
            </a>
          )}
        </nav>

        {/* Um único CTA primário em toda a página. WhatsApp fica discreto. */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <button
            onClick={() => openWhatsApp(settings, settings.whatsappWelcomeMessage, 'navbar')}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-emerald-400 font-semibold text-base transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span>{hasWhatsApp(settings) ? 'WhatsApp' : 'Contato'}</span>
          </button>

          <button
            onClick={onStartDiagnostic}
            className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-base hover:scale-105 transition-transform duration-200 shadow-md shadow-primary/20"
          >
            Diagnóstico gratuito
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-on-surface hover:text-primary"
          aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-low border-b border-outline-variant px-gutter py-6 space-y-4">
          <div className="flex flex-col">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(link.hash)}
                className="text-left py-3.5 text-lg font-semibold text-on-surface hover:text-primary border-b border-outline-variant"
              >
                {link.label}
              </button>
            ))}

            {blogLink && (
              <a
                href={blogLink.href}
                onClick={handleBlogClick}
                className="py-3.5 text-lg font-semibold text-on-surface hover:text-primary border-b border-outline-variant"
              >
                {blogLink.label}
              </a>
            )}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onStartDiagnostic();
            }}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold text-base"
          >
            Diagnóstico gratuito (1 minuto)
          </button>
        </div>
      )}
    </header>
  );
};
