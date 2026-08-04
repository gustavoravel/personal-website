import React from 'react';
import { Layers, MessageSquare, Calendar, Workflow, Database, ShieldCheck } from 'lucide-react';

export const TestedStack: React.FC = () => {
  const tools = [
    {
      icon: MessageSquare,
      name: 'WhatsApp Business API',
      category: 'Atendimento & Vendas',
      description: 'Catálogo de serviços, respostas rápidas estruturadas e fluxo de boas-vindas testado no meu próprio atendimento.',
      status: 'Testado & Validado',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      icon: Calendar,
      name: 'Cal.com / Calendly',
      category: 'Agendamento Automático',
      description: 'Integração direta com Google Calendar, convites automáticos por e-mail e lembretes configurados para evitar faltas.',
      status: 'Testado & Validado',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      icon: Workflow,
      name: 'n8n / Make Blueprints',
      category: 'Automação Operacional',
      description: 'Templates de automação para disparo de propostas, sincronização de leads e geração de relatórios sem complicação.',
      status: 'Testado & Validado',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      icon: Database,
      name: 'Notion CRM Enxuto',
      category: 'Gestão de Clientes',
      description: 'Painel visual kanban para acompanhar o status de cada lead desde o primeiro contato até o pós-venda.',
      status: 'Testado & Validado',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    }
  ];

  return (
    <section id="stack" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Infraestrutura Validada na Prática</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          Stack Tecnológico <span className="text-primary">Testado no Meu Próprio Fluxo</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Nada de testes na frente do cliente: só vendo ferramentas que eu utilizo e aprovo na minha própria operação diária.
        </p>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool, idx) => {
          const IconComp = tool.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary transition-all duration-300 flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${tool.statusColor}`}>
                    {tool.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-primary font-mono font-semibold uppercase">{tool.category}</div>
                  <h3 className="text-xl font-bold text-on-surface mt-1">{tool.name}</h3>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-on-surface-variant flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pronto para implantação rápida</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
