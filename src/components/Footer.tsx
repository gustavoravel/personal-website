import React from 'react';
import { ShieldCheck, ArrowUp, MapPin } from 'lucide-react';
import { SiteSettings } from '../types';
import { AppView } from '../App';
import { mailtoUrl } from '../lib/contact';

interface FooterProps {
  settings: SiteSettings;
  setCurrentView: (view: AppView) => void;
  onNavigateHome: (selector: string) => void;
}

/**
 * "Painel Admin" e o ícone de cadeado saíram daqui: para o visitante é
 * ruído, para um curioso é convite. O painel segue acessível por #admin.
 * "Blog Tech" volta quando existir o primeiro post publicado.
 */
export const Footer: React.FC<FooterProps> = ({ settings, setCurrentView, onNavigateHome }) => {
  const emailHref = mailtoUrl(settings, 'Contato pelo site');

  const sectionLinks = [
    { label: 'Como funciona', hash: '#como-funciona' },
    { label: 'Preços', hash: '#planos' },
    { label: 'Demonstração', hash: '#cases' },
    { label: 'Garantia', hash: '#garantia' },
    { label: 'Dúvidas frequentes', hash: '#faq' },
    { label: 'Diagnóstico gratuito', hash: '#diagnostico' }
  ];

  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest pt-14 pb-28 sm:pb-14 px-gutter text-on-surface-variant">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-outline-variant pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-lg text-on-surface leading-tight">Gustavo Ravel</span>
                <span className="text-base text-primary">Tecnologia Sem Complicação</span>
              </div>
            </div>

            <p className="text-base leading-relaxed max-w-sm">
              Eu configuro seu WhatsApp, sua agenda e seus lembretes automáticos, e te explico como usar sem jargão.
            </p>

            {(settings.city || settings.serviceArea) && (
              <p className="text-base flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{[settings.city, settings.serviceArea].filter(Boolean).join(' · ')}</span>
              </p>
            )}

            {emailHref && (
              <a href={emailHref} className="text-base text-primary hover:underline break-all block">
                {settings.contactEmail}
              </a>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-on-surface uppercase tracking-wide">Navegar</h3>
            <div className="flex flex-col gap-2.5">
              {sectionLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateHome(link.hash)}
                  className="text-base text-left hover:text-primary transition-colors w-fit"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-on-surface uppercase tracking-wide">Documentos</h3>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setCurrentView('privacidade')}
                className="text-base text-left hover:text-primary transition-colors w-fit"
              >
                Política de Privacidade
              </button>
              <button
                onClick={() => setCurrentView('termos')}
                className="text-base text-left hover:text-primary transition-colors w-fit"
              >
                Termos de Serviço
              </button>
            </div>

            {settings.meiCnpj && (
              <p className="text-base pt-2">
                CNPJ {settings.meiCnpj}
                {settings.meiRazaoSocial && (
                  <>
                    <br />
                    {settings.meiRazaoSocial}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-base">
            © {new Date().getFullYear()} Gustavo Ravel · Tecnologia Sem Complicação
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg text-base text-on-surface hover:text-primary hover:border-primary transition-all flex items-center gap-2"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
