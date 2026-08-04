import React from 'react';
import { Wrench, MessageSquare, Calendar, Bell, LayoutList } from 'lucide-react';

/**
 * Antes esta seção listava "n8n / Make Blueprints", "Notion CRM Enxuto",
 * "WhatsApp Business API" — nome de ferramenta não é benefício, e para o
 * público leigo sinaliza "vou ter que aprender algo".
 * Agora: benefício primeiro, nome da ferramenta entre parênteses, discreto.
 */
export const TestedStack: React.FC = () => {
  const tools = [
    {
      icon: MessageSquare,
      benefit: 'Seu WhatsApp responde as perguntas repetidas por você',
      detail:
        'Mensagem de boas-vindas, catálogo com seus preços e respostas prontas para o que você mais escuta. O cliente já chega sabendo o básico.',
      tool: 'WhatsApp Business'
    },
    {
      icon: Calendar,
      benefit: 'Seu cliente escolhe o horário sozinho, por um link',
      detail:
        'Ele vê só os horários que estão realmente livres na sua agenda e reserva. Você não responde nada e não corre risco de marcar dois no mesmo horário.',
      tool: 'agenda online ligada ao Google Agenda'
    },
    {
      icon: Bell,
      benefit: 'Lembrete automático antes do horário, para reduzir faltas',
      detail:
        'O aviso sai sozinho no WhatsApp do cliente algumas horas antes. Quem esqueceu, lembra. Quem não pode mais, avisa em tempo de você encaixar outro.',
      tool: 'envio automático'
    },
    {
      icon: LayoutList,
      benefit: 'Uma tela só, onde você vê em que pé está cada cliente',
      detail:
        'Sem procurar nome no meio de trezentas conversas. Você abre, olha e sabe quem está esperando resposta, quem já fechou e quem sumiu.',
      tool: 'painel simples de acompanhamento'
    }
  ];

  return (
    <section id="ferramentas" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <Wrench className="w-4 h-4" />
          <span>Testado na Minha Própria Operação</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Nada é testado <span className="text-primary">na frente do seu cliente</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Eu só monto para você o que já uso no meu próprio atendimento todos os dias. Você pode conferir funcionando comigo antes de contratar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="bg-surface-container p-7 rounded-2xl border border-outline-variant flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <IconComp className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-on-surface leading-snug">{item.benefit}</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">{item.detail}</p>
                <p className="text-sm text-on-surface-variant/80">({item.tool})</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
