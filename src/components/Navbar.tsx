import React, { useState } from 'react';
import { ShieldCheck, MessageCircle, Menu, X } from 'lucide-react';
import { SiteSettings } from '../types';

interface NavbarProps {
  currentView: 'home' | 'blog' | 'admin';
  setCurrentView: (view: 'home' | 'blog' | 'admin') => void;
  settings: SiteSettings;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  settings,
  onOpenContact
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', hash: '#hero' },
    { label: 'Dores', hash: '#dores' },
    { label: 'Como Funciona', hash: '#como-funciona' },
    { label: 'Planos', hash: '#planos' },
    { label: 'Demonstração', hash: '#cases' },
    { label: 'Quem Sou Eu', hash: '#sobre' },
    { label: 'Dúvidas (FAQ)', hash: '#faq' },
    { label: 'Diagnóstico', hash: '#diagnostico' },
  ];

  const handleNavClick = (hash: string) => {
    setCurrentView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(settings.whatsappWelcomeMessage);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="max-w-[1200px] mx-auto px-gutter h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('#hero')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-lg leading-none text-on-surface tracking-tight">
              Gustavo Ravel
            </span>
            <span className="text-xs text-primary font-semibold tracking-wider uppercase">
              Tecnologia Sem Complicação
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-5">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(link.hash)}
              className="text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors py-1"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Primary Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={openWhatsApp}
            className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </button>

          <button
            onClick={onOpenContact}
            className="bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-xs hover:scale-105 transition-transform duration-200 shadow-md shadow-primary/20"
          >
            Diagnóstico Gratuito
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-on-surface hover:text-primary"
          aria-label="Abrir menu de navegação"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-low/95 border-b border-white/10 px-gutter py-6 space-y-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(link.hash)}
                className="text-left py-2 text-sm font-semibold text-on-surface hover:text-primary border-b border-white/5"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar Gustavo no WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
