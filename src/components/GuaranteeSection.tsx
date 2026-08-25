import React from 'react';
import { SiteSettings } from '../types';
import { openWhatsApp } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { ShieldCheck, Eye, RefreshCw } from 'lucide-react';

interface GuaranteeSectionProps {
  settings: SiteSettings;
}

/**
 * Ocupa o lugar dos depoimentos removidos.
 * Com público que já foi enganado, prova verificável converte melhor
 * que cinco estrelas genéricas — e não fingimos ter carteira de clientes.
 */
export const GuaranteeSection: React.FC<GuaranteeSectionProps> = ({ settings }) => {
  const rules = [
    {
      icon: RefreshCw,
      title: 'Não funcionou em 7 dias? A etapa não é cobrada.',
      body:
        'Este é o compromisso principal, e ele vai escrito no contrato: seu WhatsApp e sua agenda funcionando em até 7 dias corridos. Se eu não entregar isso no prazo, aquela etapa sai da sua conta — não é desconto nem crédito para o futuro, é não cobrar.'
    },
    {
      icon: Eye,
      title: 'Você confere funcionando antes de pagar o restante.',
      body:
        'Metade do valor só é cobrada depois de você testar a entrega com as suas próprias mãos, no seu próprio celular. Você não paga o total para depois descobrir se ficou bom.'
    },
    {
      icon: ShieldCheck,
      title: 'As contas são suas desde o primeiro dia.',
      body:
        'Nada é criado no meu nome. Nenhum acesso fica só comigo. Se você me demitir amanhã, você continua dono de tudo e nada para de funcionar.'
    }
  ];

  return (
    <section id="garantia" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/25">
          <ShieldCheck className="w-4 h-4" />
          <span>Garantia por Escrito</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          O que eu prometo — <span className="text-emerald-400">e o que acontece se eu não cumprir</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rules.map((rule, idx) => {
          const IconComp = rule.icon;
          return (
            <div key={idx} className="bg-surface-container p-7 rounded-2xl border border-outline-variant space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <IconComp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-on-surface leading-snug">{rule.title}</h3>
              <p className="text-base text-on-surface-variant leading-relaxed">{rule.body}</p>
            </div>
          );
        })}
      </div>

      {/* Prova honesta no lugar de depoimento inventado */}
      <div className="bg-surface-container-low p-8 md:p-10 rounded-2xl border border-primary/25 max-w-3xl mx-auto space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-on-surface leading-snug">
          Por que você não vê depoimento nenhum nesta página
        </h3>
        <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
          Porque eu ainda estou montando minha carteira de clientes — e eu não vou inventar elogio nem usar foto de banco de imagem para parecer maior do que sou.
          Se você já contratou alguém que enfeitou o serviço e depois sumiu, sabe exatamente por que isso importa.
        </p>
        <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
          O que eu ofereço no lugar: <strong className="text-on-surface">você vê o sistema funcionando na minha própria operação antes de contratar</strong>, o
          primeiro diagnóstico é gratuito, e a garantia acima está escrita no contrato. Quando eu tiver cliente satisfeito, o depoimento vai aparecer aqui com nome, rosto e negócio reais — e você vai poder ligar para conferir.
        </p>
        <button
          onClick={() => openWhatsApp(settings, 'Olá Gustavo! Quero ver o sistema funcionando antes de contratar. Pode me mostrar?', 'garantia')}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
        >
          <WhatsAppIcon className="w-5 h-5" />
          <span>Quero ver funcionando antes de contratar</span>
        </button>
      </div>
    </section>
  );
};
