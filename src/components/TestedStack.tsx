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
      benefit: 'O compromisso entra na agenda do próprio cliente',
      detail:
        'Assim que ele marca, recebe a confirmação por e-mail e o horário cai no celular dele — que avisa sozinho, como avisa de qualquer outro compromisso. Quem esqueceu, lembra; quem não pode mais, desmarca a tempo de você encaixar outro.',
      tool: 'convite de agenda e e-mail de confirmação, sem custo por mensagem'
    },
    {
      icon: LayoutList,
      benefit: 'Tarefas repetitivas acontecendo sem você digitar',
      detail:
        'Mandar o orçamento, cobrar quem ficou de responder, retomar quem sumiu no meio. São coisas que você faz na mão todo dia e que passam a acontecer sozinhas — quais exatamente, a gente decide olhando o seu atendimento.',
      tool: 'incluso no plano Completo'
    }
  ];

  return (
    <section id="ferramentas" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-10">
      {/* A foto é a prova da frase: esta é a operação onde tudo roda antes
          de chegar no cliente. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
            <Wrench className="w-4 h-4" />
            <span>Testado na Minha Própria Operação</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
            Nada é testado <span className="text-primary">na frente do seu cliente</span>
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Eu só monto para você o que já uso no meu próprio atendimento todos os dias. Antes de contratar,
            você pode me pedir para mostrar cada uma dessas coisas funcionando — ao vivo, na minha tela.
          </p>
        </div>

        <img
          src="/gustavo-trabalhando.jpg"
          alt="Gustavo Ravel trabalhando em sua mesa, configurando um sistema no notebook"
          width={1000}
          height={1000}
          loading="lazy"
          className="w-full max-w-md mx-auto rounded-2xl border border-outline-variant object-cover"
        />
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
