import React, { useState } from 'react';
import { Plan, SiteSettings } from '../types';
import { openWhatsApp } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Wallet, BadgeCheck, Unlock, KeyRound, Copy, Check, Building2 } from 'lucide-react';

interface BillingExplainedProps {
  plans: Plan[];
  settings: SiteSettings;
}

/**
 * Responde, em uma tela, o que trava a venda de quem já foi enganado:
 * é mensalidade? tem fidelidade? o que acontece se não funcionar?
 * o que continua meu? as ferramentas estão inclusas?
 *
 * Modelo conforme o Offer Triangle: pagamento único por configuração.
 */
export const BillingExplained: React.FC<BillingExplainedProps> = ({ plans, settings }) => {
  const [copied, setCopied] = useState(false);

  const cheapest = plans.length ? Math.min(...plans.map((p) => p.price)) : 0;

  const handleCopyPix = async () => {
    if (!settings.pixKey) return;
    await navigator.clipboard.writeText(settings.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cards = [
    {
      icon: Wallet,
      title: 'Você paga uma vez só',
      body: `A configuração começa em R$ ${cheapest.toLocaleString('pt-BR')} e é cobrada uma única vez. Não é mensalidade: não volta no mês seguinte, não renova sozinha e não aparece no seu cartão todo mês.`,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      icon: Unlock,
      title: 'Sem fidelidade e sem contrato longo',
      body:
        'Não existe prazo mínimo, multa de cancelamento nem plano para cancelar. É um serviço com começo, meio e fim: eu configuro, você aprova, acabou. Se quiser mais alguma coisa depois, você me chama — e só aí a gente combina.',
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    },
    {
      icon: BadgeCheck,
      title: 'Não funcionou em 7 dias? A etapa não é cobrada',
      body:
        'Esse é o compromisso que eu assumo por escrito: seu WhatsApp e sua agenda funcionando em até 7 dias corridos. Se eu não entregar isso no prazo, aquela etapa sai da sua conta.',
      accent: 'text-primary bg-primary/10 border-primary/30'
    },
    {
      icon: KeyRound,
      title: 'O que foi montado é seu, para sempre',
      body:
        'Tudo é criado no seu nome e no seu e-mail: WhatsApp, agenda e link de agendamento. Depois da entrega, continua funcionando sem depender de mim e sem você me pagar mais nada. Você não fica refém.',
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
          Se depois de ler esta parte ainda ficar qualquer dúvida sobre valores, me pergunte direto.
          Preço escondido é o começo de toda enrolação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div key={idx} className="bg-surface-container p-7 rounded-2xl border border-outline-variant flex items-start gap-4">
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

      <div className="bg-surface-container-low p-7 rounded-2xl border border-outline-variant max-w-3xl mx-auto space-y-3">
        <h3 className="text-lg font-bold text-on-surface">Para comparar com o que você já conhece</h3>
        <p className="text-base text-on-surface-variant leading-relaxed">
          Uma recepcionista para atender e marcar horários custa, com encargos, mais de R$ 2.000 <strong>por mês</strong>.
          Um anúncio patrocinado consome de R$ 300 a R$ 600 <strong>por mês</strong> e para de aparecer no dia em que você para de pagar.
          Aqui você paga uma vez e o atendimento continua rodando todo dia — inclusive de madrugada e no fim de semana.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container p-7 rounded-2xl border border-outline-variant space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Formas de pagamento</h3>
          <p className="text-base text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Metade na aprovação e metade só depois de funcionar</strong> —
            você testa a entrega antes de pagar o restante. E se não estiver funcionando em 7 dias, aquela etapa
            não é cobrada. Aceito Pix e cartão, com recibo de todos os valores.
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
            Todo serviço tem um contrato curto, em português claro, com o que será entregue, o prazo de 7 dias
            e a regra de garantia escritos. Você lê antes de pagar qualquer coisa.
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
          onClick={() => openWhatsApp(settings, 'Olá Gustavo! Tenho uma dúvida sobre os valores e a forma de pagamento.', 'pagamento')}
          className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-base"
        >
          <WhatsAppIcon className="w-5 h-5" />
          <span>Ficou alguma dúvida sobre preço? Me pergunte direto</span>
        </button>
      </div>
    </section>
  );
};
