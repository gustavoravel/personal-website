import React from 'react';
import { MessageSquare, Settings2, Sparkles, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: MessageSquare,
      title: 'Conversamos (Diagnóstico Gratuito)',
      description: 'Entendo como funciona o seu atendimento hoje e identificamos onde você está perdendo clientes ou tempo precioso.'
    },
    {
      step: '02',
      icon: Settings2,
      title: 'Eu Configuro Tudo em 7 Dias',
      description: 'Monto seu WhatsApp comercial, seu agendamento online e os lembretes automáticos. Tudo criado no seu e-mail e no seu nome. Se não estiver funcionando em 7 dias, a etapa não é cobrada.'
    },
    {
      step: '03',
      icon: Sparkles,
      title: 'Você Usa sem Complicação',
      description: 'Te entrego o sistema 100% testado e te explico passo a passo como funciona. Você comanda seu atendimento direto no celular.'
    }
  ];

  return (
    <section id="como-funciona" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <CheckCircle2 className="w-4 h-4" />
          <span>Passo a Passo Transparente</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Como Funciona o Meu Serviço
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Três etapas simples para colocar a sua tecnologia para rodar sem dores de cabeça.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="bg-surface-container p-8 rounded-2xl border border-outline-variant hover:border-primary/50 transition-all space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface-variant/30">{item.step}</span>
                </div>

                <h3 className="text-xl font-bold text-on-surface leading-snug">{item.title}</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
