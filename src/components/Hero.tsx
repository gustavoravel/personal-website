import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';
import { openWhatsApp, hasWhatsApp } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface HeroProps {
  settings: SiteSettings;
  onStartDiagnostic: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onStartDiagnostic }) => {
  // Compromissos verificáveis no lugar de métricas inventadas
  // ("100% de produtividade", "faltas a zero" — nada disso é conferível).
  const commitments = [
    {
      value: '7 dias',
      label: 'Funcionando no prazo — ou a etapa não é cobrada',
      color: 'text-primary'
    },
    {
      value: 'No seu nome',
      label: 'Todas as contas e acessos são seus, desde o primeiro dia',
      color: 'text-emerald-400'
    },
    {
      value: 'Pago uma vez',
      label: 'Sem mensalidade, sem fidelidade e sem cobrança que se repete',
      color: 'text-sky-400'
    }
  ];

  return (
    <section id="hero" className="pt-32 pb-16 px-gutter max-w-[1200px] mx-auto text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="inline-flex items-center gap-2 bg-surface-container-high border border-primary/30 px-4 py-2 rounded-full text-sm font-semibold text-primary mb-8">
        <ShieldCheck className="w-4 h-4" />
        <span>Pronto em 7 dias · Você fala direto comigo</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface mb-6 max-w-4xl mx-auto leading-tight">
        Sua tecnologia funcionando —{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-emerald-300">
          sem você precisar entender de tecnologia
        </span>
      </h1>

      <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
        Eu organizo seu WhatsApp comercial e coloco sua agenda online no ar, e entrego tudo pronto para usar em 7 dias.
        Se não estiver funcionando no prazo, a etapa não é cobrada.
      </p>

      {/* Um CTA primário. O WhatsApp é opção secundária discreta. */}
      <div className="flex flex-col items-center gap-4 mb-16">
        <button
          onClick={onStartDiagnostic}
          className="w-full sm:w-auto bg-primary text-on-primary font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.03] transition-all duration-200 shadow-lg shadow-primary/25 text-lg"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>Quero meu diagnóstico gratuito (1 minuto)</span>
        </button>

        <button
          onClick={() => openWhatsApp(settings, settings.whatsappWelcomeMessage, 'hero')}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-emerald-400 font-semibold text-base transition-colors underline-offset-4 hover:underline"
        >
          <WhatsAppIcon className="w-5 h-5" />
          <span>{hasWhatsApp(settings) ? 'Ou me chame no WhatsApp' : 'Ou me mande uma mensagem'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-8 border-t border-outline-variant">
        {commitments.map((item, idx) => (
          <div key={idx} className="bg-surface-container p-6 rounded-xl text-left border border-outline-variant">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-base text-on-surface-variant mt-1.5 leading-snug">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
