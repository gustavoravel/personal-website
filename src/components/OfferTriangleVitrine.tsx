import React from 'react';
import { Plan, EntryOffer, SiteSettings } from '../types';
import { openWhatsApp } from '../lib/contact';
import { CheckCircle, Sparkles, MessageCircle, Tag, Clock } from 'lucide-react';

interface OfferTriangleVitrineProps {
  plans: Plan[];
  entryOffer: EntryOffer;
  settings: SiteSettings;
}

/**
 * Vitrine de preços. Duas regras de linguagem aqui:
 * - benefício primeiro, ferramenta depois (o cliente não compra Cal.com,
 *   ele compra parar de trocar oito mensagens para marcar um horário);
 * - nada de "Starter/Core/Premium" nem de vocabulário de framework interno.
 */
export const OfferTriangleVitrine: React.FC<OfferTriangleVitrineProps> = ({ plans, entryOffer, settings }) => {
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
          Você paga a montagem uma vez. O acompanhamento mensal é opcional, começa barato e pode ser cancelado quando quiser.
        </p>
      </div>

      {/* Porta de entrada barata: quem desconfia compra um teste pequeno,
          não uma recorrência de R$ 999 no primeiro contato. */}
      <div className="bg-surface-container-low border-2 border-emerald-500/40 rounded-2xl p-7 md:p-9 space-y-5 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
              <Sparkles className="w-4 h-4" />
              <span>Para me testar primeiro</span>
            </div>
            <h3 className="text-2xl font-bold text-on-surface leading-snug">{entryOffer.name}</h3>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-4xl font-extrabold text-emerald-400">{money(entryOffer.price)}</div>
            <div className="text-base text-on-surface-variant">pagamento único</div>
          </div>
        </div>

        <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">{entryOffer.description}</p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entryOffer.includes.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-base text-on-surface">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <button
            onClick={() => openWhatsApp(settings, entryOffer.whatsappMessage)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 text-base transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Quero esse serviço avulso</span>
          </button>

          <span className="inline-flex items-center gap-2 text-base text-on-surface-variant">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Entrega em {entryOffer.deliveryTime}</span>
          </span>
        </div>
      </div>

      {/* Planos completos */}
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
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-on-surface">{plan.name}</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">{plan.description}</p>
              </div>

              {/* Implantação (uma vez) separada do acompanhamento (mensal) */}
              <div className="border-y border-outline-variant py-5 space-y-3">
                <div>
                  <div className="text-base text-on-surface-variant font-semibold">Montagem, uma vez só</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-primary">{money(plan.setupPrice)}</span>
                    <span className="text-base text-on-surface-variant">à vista ou em 2x</span>
                  </div>
                </div>

                {plan.monthlyPrice > 0 && (
                  <div className="pt-2 border-t border-outline-variant/60">
                    <div className="text-base text-on-surface-variant font-semibold">
                      Acompanhamento opcional
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-on-surface">
                        + {money(plan.monthlyPrice)}
                      </span>
                      <span className="text-base text-on-surface-variant">por mês, cancela quando quiser</span>
                    </div>
                  </div>
                )}
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

              {plan.monthlyCovers.length > 0 && plan.monthlyPrice > 0 && (
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant space-y-2.5">
                  <div className="text-base font-bold text-on-surface">
                    O que a mensalidade cobre todo mês:
                  </div>
                  <ul className="space-y-2">
                    {plan.monthlyCovers.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-base text-on-surface-variant leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 bg-surface-container-low rounded-b-2xl border-t border-outline-variant">
              <button
                onClick={() => openWhatsApp(settings, plan.whatsappMessage)}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  plan.isPopular
                    ? 'bg-primary text-on-primary hover:scale-[1.02] shadow-md shadow-primary/20'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
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
