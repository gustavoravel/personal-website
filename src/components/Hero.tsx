import React from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onStartDiagnostic: () => void;
  onOpenPlans: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onStartDiagnostic, onOpenPlans }) => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Olá Gustavo! Vi seu site e quero tirar uma dúvida sobre a configuração do meu atendimento.');
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section id="hero" className="pt-32 pb-16 px-gutter max-w-[1200px] mx-auto text-center relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 bg-surface-container-high border border-primary/30 px-4 py-2 rounded-full text-xs font-semibold text-primary mb-8 shadow-inner">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span>Configuração Pronta em 3 Dias Úteis · Suporte Direto Comigo</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface mb-6 max-w-4xl mx-auto leading-tight">
        Sua tecnologia funcionando —{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-emerald-300">
          sem você precisar entender de tecnologia
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Eu configuro seu WhatsApp, sua agenda online e seus lembretes automáticos para você parar de perder clientes. Tudo entregue pronto em 3 dias úteis. Se não funcionar como combinado, eu refaço.
      </p>

      {/* Primary CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <button
          onClick={onStartDiagnostic}
          className="w-full sm:w-auto bg-primary text-on-primary font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.03] transition-all duration-200 shadow-lg shadow-primary/25 text-base"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Quero Meu Diagnóstico Gratuito (1 min)</span>
        </button>

        <button
          onClick={openWhatsApp}
          className="w-full sm:w-auto glass-panel text-on-surface hover:text-emerald-400 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:border-emerald-500/50 text-base"
        >
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span>Falar com Gustavo no WhatsApp</span>
        </button>
      </div>

      {/* Verifiable Commitments Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8 border-t border-white/10">
        <div className="glass-panel p-5 rounded-xl text-left border border-white/10">
          <div className="text-xl font-bold text-primary">3 Dias Úteis</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Prazo assumido em contrato</div>
        </div>

        <div className="glass-panel p-5 rounded-xl text-left border border-white/10">
          <div className="text-xl font-bold text-emerald-400">100% no Seu Nome</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Todas as contas e acessos são seus</div>
        </div>

        <div className="glass-panel p-5 rounded-xl text-left border border-white/10">
          <div className="text-xl font-bold text-sky-400">Garantia Real</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Se não funcionar como combinado, eu refaço</div>
        </div>
      </div>
    </section>
  );
};
