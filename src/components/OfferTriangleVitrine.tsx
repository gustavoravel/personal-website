import React from 'react';
import { Plan, SiteSettings } from '../types';
import { CheckCircle, Sparkles, MessageCircle, ArrowUpRight, Layers } from 'lucide-react';

interface OfferTriangleVitrineProps {
  plans: Plan[];
  settings: SiteSettings;
}

export const OfferTriangleVitrine: React.FC<OfferTriangleVitrineProps> = ({ plans, settings }) => {
  const handleSelectPlan = (plan: Plan) => {
    const text = encodeURIComponent(plan.whatsappMessage);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section id="planos" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-16">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Planos &amp; Investimento Transparente</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          Escolha a Solução Ideal para o <span className="text-primary">Seu Negócio</span>
        </h2>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Tudo o que você precisa para parar de perder clientes e transmitir profissionalismo imediato. Sem mensalidades ocultas ou amarras.
        </p>
      </div>

      {/* 3 Pillars Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-l-4 border-l-sky-400">
          <div className="text-sky-400 font-mono text-xs uppercase font-bold tracking-wider mb-2">Pilar 1</div>
          <h3 className="text-xl font-bold text-on-surface mb-2">1. WhatsApp Comercial</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Mensagens de saudação, catálogo de serviços e respostas rápidas configuradas no seu aplicativo.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-l-4 border-l-primary">
          <div className="text-primary font-mono text-xs uppercase font-bold tracking-wider mb-2">Pilar 2</div>
          <h3 className="text-xl font-bold text-on-surface mb-2">2. Agendamento Automático</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Link direto onde seu próprio cliente escolhe o horário vago na sua agenda com lembretes automáticos.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-l-4 border-l-emerald-400">
          <div className="text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider mb-2">Pilar 3</div>
          <h3 className="text-xl font-bold text-on-surface mb-2">3. Página na Web</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Página rápida e elegante que exibe seus serviços, preços transparentes e botão direto para o seu WhatsApp.
          </p>
        </div>
      </div>

      {/* Pricing Cards (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-panel rounded-2xl flex flex-col transition-all duration-300 relative ${
              plan.isPopular
                ? 'border-2 border-primary glow-accent md:-translate-y-4 bg-surface-container-low/90'
                : 'hover:border-primary/60 hover:scale-[1.01]'
            }`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-3.5 right-6 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mais Recomendado</span>
              </div>
            )}

            <div className="p-8 flex-grow space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-on-surface mb-1">{plan.name}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{plan.description}</p>
              </div>

              {/* Pricing Display */}
              <div className="border-y border-white/10 py-4">
                <span className="text-4xl font-extrabold text-primary">
                  R$ {plan.price.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-on-surface-variant font-medium ml-1">
                  {plan.period}
                </span>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 pt-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-on-surface">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card Footer Button */}
            <div className="p-6 bg-surface-container-low/80 rounded-b-2xl border-t border-white/10">
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.isPopular
                    ? 'bg-primary text-on-primary hover:scale-[1.02] shadow-md shadow-primary/20'
                    : 'glass-panel text-on-surface hover:bg-white/10 border border-white/20'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{plan.ctaText}</span>
                <ArrowUpRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
