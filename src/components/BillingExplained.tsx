import React, { useState } from 'react';
import { Plan, SiteSettings } from '../types';
import { openWhatsApp } from '../lib/contact';
import {
  Wallet,
  CalendarClock,
  Unlock,
  KeyRound,
  Copy,
  Check,
  Building2,
  MessageCircle
} from 'lucide-react';

interface BillingExplainedProps {
  plans: Plan[];
  settings: SiteSettings;
}

/**
 * Responde, em uma tela, as perguntas que travam a venda:
 * é mensalidade para sempre? tem prazo mínimo? o que a mensalidade cobre?
 * o que continua meu se eu cancelar? as ferramentas estão inclusas?
 */
export const BillingExplained: React.FC<BillingExplainedProps> = ({ plans, settings }) => {
  const [copied, setCopied] = useState(false);

  const cheapestSetup = plans.length
    ? Math.min(...plans.map((p) => p.setupPrice))
    : 0;
  const cheapestMonthly = plans.length
    ? Math.min(...plans.filter((p) => p.monthlyPrice > 0).map((p) => p.monthlyPrice))
    : 0;

  const handleCopyPix = async () => {
    if (!settings.pixKey) return;
    await navigator.clipboard.writeText(settings.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cards = [
    {
      icon: Wallet,
      title: 'Você paga a montagem uma vez só',
      body: `A implantação é o valor de montar tudo: a partir de R$ ${cheapestSetup.toLocaleString('pt-BR')}, cobrado uma única vez. Não é mensalidade e não volta no mês seguinte.`,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      icon: CalendarClock,
      title: 'A mensalidade é opcional — e barata',
      body: `O acompanhamento começa em R$ ${cheapestMonthly.toLocaleString('pt-BR')} por mês e cobre hospedagem da sua página, alterações quando você pedir e consertos sem custo. Se você preferir só a montagem, sem acompanhamento, também dá.`,
      accent: 'text-primary bg-primary/10 border-primary/30'
    },
    {
      icon: Unlock,
      title: 'Sem prazo mínimo e sem multa',
      body:
        settings.minimumContractMonths > 0
          ? `O acompanhamento tem prazo mínimo de ${settings.minimumContractMonths} meses. Depois disso você cancela quando quiser, avisando com 30 dias.`
          : 'Não existe fidelidade, prazo mínimo nem multa de cancelamento. Você avisa que quer parar e para no fim do mês — sem discussão e sem taxa.',
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    },
    {
      icon: KeyRound,
      title: 'Se você cancelar, o sistema continua seu',
      body:
        'Tudo é criado no seu nome e no seu e-mail: WhatsApp, agenda, link de agendamento e domínio. Cancelando o acompanhamento, isso tudo continua funcionando na sua mão. Você só passa a cuidar dos ajustes por conta própria.',
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    }
  ];

  return (
    <section id="cobranca" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <Wallet className="w-4 h-4" />
          <span>Como Funciona a Cobrança</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Sem pegadinha na conta: <span className="text-primary">o que você paga e quando</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Se depois de ler esta parte ainda ficar qualquer dúvida sobre valores, me pergunte direto. Preço escondido é o começo de toda enrolação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className="bg-surface-container p-7 rounded-2xl border border-outline-variant flex items-start gap-4"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${card.accent}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-on-surface leading-snug">{card.title}</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">{card.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparativo com a alternativa que o cliente já conhece */}
      <div className="bg-surface-container-low p-7 rounded-2xl border border-outline-variant max-w-3xl mx-auto space-y-3">
        <h3 className="text-lg font-bold text-on-surface">Para comparar com o que você já conhece</h3>
        <p className="text-base text-on-surface-variant leading-relaxed">
          Uma recepcionista para atender e marcar horários custa, com encargos, mais de R$ 2.000 por mês. Um anúncio patrocinado que só aparece enquanto você paga consome de R$ 300 a R$ 600 por mês e não organiza nada.
          O agendamento automático é montado uma vez e trabalha todo dia, inclusive de madrugada e no fim de semana.
        </p>
      </div>

      {/* Formas de pagamento — só exibe dado que existe de verdade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container p-7 rounded-2xl border border-outline-variant space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Formas de pagamento</h3>
          <p className="text-base text-on-surface-variant leading-relaxed">
            A implantação é dividida em <strong className="text-on-surface">metade na aprovação e metade na entrega testada</strong> —
            ou seja, você só paga o restante depois de ver funcionando. Aceito Pix e cartão, e emito recibo de todos os valores.
          </p>

          {settings.pixKey ? (
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-2">
              <div className="flex justify-between text-sm text-on-surface-variant font-semibold">
                <span>Chave Pix ({settings.pixKeyType})</span>
                {settings.pixReceiverName && <span className="text-primary">{settings.pixReceiverName}</span>}
              </div>
              <div className="flex items-center justify-between gap-3 bg-surface-container p-3 rounded-lg border border-outline-variant text-base text-on-surface overflow-hidden">
                <span className="truncate">{settings.pixKey}</span>
                <button
                  onClick={handleCopyPix}
                  className="bg-primary/20 text-primary hover:bg-primary hover:text-on-primary px-3 py-2 rounded font-bold transition-colors flex items-center gap-1.5 shrink-0 text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-base text-on-surface-variant">
              Os dados de pagamento são combinados na proposta, antes de qualquer cobrança.
            </p>
          )}
        </div>

        <div className="bg-surface-container p-7 rounded-2xl border border-outline-variant space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Contrato e nota fiscal</h3>
          </div>

          <p className="text-base text-on-surface-variant leading-relaxed">
            Todo serviço tem um contrato curto, em português claro, com o prazo de entrega e a regra de garantia escritos. Você lê antes de pagar qualquer coisa.
          </p>

          {settings.meiCnpj ? (
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-2 text-base">
              <div className="flex justify-between gap-4 border-b border-outline-variant pb-2">
                <span className="text-on-surface-variant">CNPJ</span>
                <span className="text-on-surface font-bold">{settings.meiCnpj}</span>
              </div>
              {settings.meiRazaoSocial && (
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Razão social</span>
                  <span className="text-on-surface font-bold text-right">{settings.meiRazaoSocial}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-base text-on-surface-variant">
              Os dados da empresa constam no contrato que você recebe antes de fechar.
            </p>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => openWhatsApp(settings, 'Olá Gustavo! Tenho uma dúvida sobre os valores e a forma de cobrança.')}
          className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-base"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Ficou alguma dúvida sobre preço? Me pergunte direto</span>
        </button>
      </div>
    </section>
  );
};
