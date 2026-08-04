import React from 'react';
import { AlertCircle, Clock, XCircle, FileQuestion, UserX } from 'lucide-react';

export const PainPoints: React.FC = () => {
  const pains = [
    {
      icon: Clock,
      title: 'Você responde WhatsApp de madrugada ou nos finais de semana',
      description: 'Muitas mensagens soltas do tipo "qual o valor?" e você perde tempo digitando as mesmas explicações repetidas vezes.'
    },
    {
      icon: UserX,
      title: 'O cliente marca um horário e simplesmente não aparece',
      description: 'Sem um lembrete automático antes da reunião ou consulta, a taxa de faltas é alta e você perde tempo vago na agenda.'
    },
    {
      icon: FileQuestion,
      title: 'Trocam 8 mensagens para conseguir fechar uma data',
      description: '"Pode terça às 14h?", "Não, quinta pode?". Essa negociação demorada faz clientes ocupados desisterem no meio do caminho.'
    },
    {
      icon: XCircle,
      title: 'Já pagou fornecedores ou freelancers que sumiram no meio',
      description: 'Prometeram mundos e fundos, deixaram sistemas incompletos ou em nomes de terceiros e você ficou na mão sem suporte.'
    }
  ];

  return (
    <section id="dores" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Sua Rotina Hoje</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Algum desses problemas <span className="text-amber-400">acontece no seu negócio?</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Se você se identifica com uma dessas situações, o problema não é a sua dedicação — é a falta de um fluxo automático simples.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pains.map((pain, idx) => {
          const IconComp = pain.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <IconComp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-on-surface leading-snug">{pain.title}</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{pain.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
