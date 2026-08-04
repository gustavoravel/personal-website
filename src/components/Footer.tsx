import React from 'react';
import { ShieldCheck, Heart, ArrowUp } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  setCurrentView: (view: 'home' | 'blog' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setCurrentView }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-surface-container-lowest py-16 px-gutter text-on-surface-variant text-xs">
      <div className="max-w-[1200px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-on-surface">Gustavo Ravel</span>
            </div>
            <p className="text-on-surface-variant max-w-sm">
              {settings.heroSubheadline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => { setCurrentView('home'); window.location.hash = '#planos'; }} className="hover:text-primary transition-colors">
              Planos &amp; Vitrine
            </button>
            <button onClick={() => { setCurrentView('home'); window.location.hash = '#cases'; }} className="hover:text-primary transition-colors">
              Cases Demo
            </button>
            <button onClick={() => { setCurrentView('home'); window.location.hash = '#diagnostico'; }} className="hover:text-primary transition-colors">
              Diagnóstico Gratuito
            </button>
            <button onClick={() => setCurrentView('blog')} className="hover:text-primary transition-colors">
              Blog Tech
            </button>
            <button onClick={() => setCurrentView('admin')} className="hover:text-primary transition-colors">
              Painel Admin
            </button>
          </div>
        </div>

        {/* Copyright & Top Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-mono text-on-surface-variant">
              © {new Date().getFullYear()} Gustavo Ravel - Tecnologia Sem Complicação. Todos os direitos reservados.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="glass-panel p-3 rounded-lg text-on-surface hover:text-primary hover:border-primary transition-all flex items-center gap-2"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
