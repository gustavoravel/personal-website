import React from 'react';
import { SiteSettings } from '../types';
import { hasWhatsApp, openWhatsApp } from '../lib/contact';
import { CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface StickyWhatsAppProps {
  settings: SiteSettings;
  onStartDiagnostic: () => void;
}

/**
 * Barra fixa no rodapé, só no mobile: um CTA primário (diagnóstico) e o
 * WhatsApp ao lado. O cliente lê esta página no celular, muitas vezes na rua.
 */
export const StickyWhatsApp: React.FC<StickyWhatsAppProps> = ({ settings, onStartDiagnostic }) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex gap-2 p-3 bg-surface-container-lowest/95 border-t border-outline-variant backdrop-blur">
      <button
        onClick={onStartDiagnostic}
        className="flex-grow bg-primary text-on-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-base"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span>Diagnóstico gratuito</span>
      </button>

      <button
        onClick={() => openWhatsApp(settings, settings.whatsappWelcomeMessage, 'barra-fixa-mobile')}
        aria-label={hasWhatsApp(settings) ? 'Falar com Gustavo no WhatsApp' : 'Ir para o formulário de contato'}
        className="w-14 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0"
      >
        <WhatsAppIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
