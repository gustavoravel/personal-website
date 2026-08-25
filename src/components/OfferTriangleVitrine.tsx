import React from 'react';
import { EntryOffer, Plan, SiteSettings } from '../types';
import { openWhatsApp } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { CheckCircle, Sparkles, Tag, LifeBuoy } from 'lucide-react';

interface OfferTriangleVitrineProps {
  plans: Plan[];
  settings: SiteSettings;
  /**
   * A oferta de entrada é editável no admin e chega até aqui, mas ainda não
   * tem bloco na vitrine — este componente nunca chegou a renderizá-la.
   * Declarada como opcional para o App compilar; falta decidir onde ela entra.
   */
  entryOffer?: EntryOffer;
}

/**
 * Vitrine de preços. Duas regras de linguagem aqui:
 * - benefício primeiro, ferramenta depois (o cliente não compra Cal.com,
 *   ele compra parar de trocar oito mensagens para marcar um horário);
 * - nada de "Starter/Core/Premium" nem de vocabulário de framework interno.
 */
export const OfferTriangleVitrine: React.FC<OfferTriangleVitrineProps> = ({ plans, settings }) => {
  const money = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

  return (
    <section id="planos" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <Tag className="w-4 h-4" />
          <span>O Que Você Recebe</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Escolha o tamanho que faz sentido <span className="text-primary">para o seu negócio hoje</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Você paga uma vez pela configuração e o sistema é seu. Não existe mensalidade, não existe fidelidade
          e tudo fica pronto em até 7 dias.
        </p>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl flex flex-col transition-all duration-300 relative bg-surface-container ${
              plan.isPopular
                ? 'border-2 border-primary glow-accent md:-translate-y-4'
                : 'border border-outline-variant hover:border-primary/60'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                <Sparkles className="w-4 h-4" />
                <span>Mais escolhido</span>
              </div>
            )}

            <div className="p-8 flex-grow space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-on-surface">{plan.name}</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">{plan.description}</p>

                {plan.highlight && (
                  <p className="text-base text-on-surface leading-relaxed border-l-4 border-primary pl-4 py-1">
                    {plan.highlight}
                  </p>
                )}
              </div>

              {/* Pagamento único: sem mensalidade, sem fidelidade. */}
              <div className="border-y border-outline-variant py-5 space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-extrabold text-primary">{money(plan.price)}</span>
                  <span className="text-base text-on-surface-variant">uma vez só</span>
                </div>
                <div className="text-base text-emerald-300 font-semibold">
                  Sem mensalidade e sem fidelidade
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-base font-bold text-on-surface">Você recebe:</div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-base text-on-surface leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.supportPeriod && (
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-emerald-500/25 flex items-start gap-3">
                  <LifeBuoy className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-base text-on-surface leading-relaxed">
                    <strong>{plan.supportPeriod} de suporte incluso</strong> por WhatsApp, direto comigo,
                    para tirar dúvida ou ajustar o que precisar.
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-surface-container-low rounded-b-2xl border-t border-outline-variant">
              <button
                onClick={() => openWhatsApp(settings, plan.whatsappMessage, `planos:${plan.name}`)}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  plan.isPopular
                    ? 'bg-primary text-on-primary hover:scale-[1.02] shadow-md shadow-primary/20'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant'
                }`}
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>{plan.ctaText}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-base text-on-surface-variant max-w-2xl mx-auto">
        Não sabe qual escolher? Faça o diagnóstico gratuito de 1 minuto — no fim dele eu te digo qual faz sentido, mesmo que seja nenhum.
      </p>
    </section>
  );
};
