import React, { useState } from 'react';
import { CaseStudy } from '../types';
import { Award, Clock, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CaseStudiesDemoProps {
  caseStudies: CaseStudy[];
}

export const CaseStudiesDemo: React.FC<CaseStudiesDemoProps> = ({ caseStudies }) => {
  const [activeTab, setActiveTab] = useState<string>(caseStudies[0]?.id || 'case-1');
  const [showAfterState, setShowAfterState] = useState<boolean>(true);

  const activeCase = caseStudies.find((c) => c.id === activeTab) || caseStudies[0];

  return (
    <section id="cases" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Demonstração de Protótipo Funcional</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          Demonstração: <span className="text-primary">Como Fica o Seu Atendimento na Prática</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Veja a diferença real entre o atendimento manual cansativo e o sistema automatizado pronto em 3 dias úteis.
        </p>
      </div>

      {/* Case Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {caseStudies.map((cs) => (
          <button
            key={cs.id}
            onClick={() => {
              setActiveTab(cs.id);
              setShowAfterState(true);
            }}
            className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === cs.id
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105'
                : 'glass-panel text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <span>{cs.badgeText}</span>
            <span className="opacity-80">| {cs.title.split(' ')[0]}...</span>
          </button>
        ))}
      </div>

      {/* Active Case Card */}
      {activeCase && (
        <div className="glass-panel rounded-2xl p-8 md:p-10 border border-white/10 space-y-8">
          {/* Top Banner Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 text-xs text-primary font-mono font-bold uppercase mb-2">
                <span>{activeCase.clientCategory}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <Clock className="w-3.5 h-3.5" />
                  {activeCase.timeframe}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface">
                {activeCase.title}
              </h3>
              <p className="text-on-surface-variant text-xs sm:text-sm mt-2 max-w-2xl">
                {activeCase.summary}
              </p>
            </div>

            {/* Impact Metric Badge */}
            <div className="bg-surface-container-high border border-primary/30 p-4 rounded-xl text-center shrink-0 min-w-[160px]">
              <div className="text-2xl md:text-3xl font-extrabold text-primary">{activeCase.metric}</div>
              <div className="text-xs text-on-surface-variant font-semibold mt-1">
                {activeCase.metricLabel}
              </div>
            </div>
          </div>

          {/* Interactive Before/After Toggle */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Comparativo de Processo:
              </span>

              <div className="bg-surface-container-high p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setShowAfterState(false)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    !showAfterState
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Antes (Manual)
                </button>
                <button
                  onClick={() => setShowAfterState(true)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    showAfterState
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Depois (Automatizado)
                </button>
              </div>
            </div>

            {/* Comparison Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Column: Details */}
              <div
                className={`p-6 rounded-xl border transition-all ${
                  showAfterState
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-lg mb-4">
                  {showAfterState ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-300">{activeCase.after.status}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                      <span className="text-rose-300">{activeCase.before.status}</span>
                    </>
                  )}
                </div>

                <ul className="space-y-3">
                  {(showAfterState ? activeCase.after.points : activeCase.before.points).map(
                    (point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-on-surface">
                        <span
                          className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            showAfterState ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{point}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Right Column: Visual Preview */}
              <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4 bg-surface-container-lowest">
                <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant border-b border-white/10 pb-3">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span>Visão da Conversa no WhatsApp</span>
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded font-mono text-[11px]">
                    Status: {showAfterState ? 'Ativo 24h' : 'Pendente'}
                  </span>
                </div>

                {showAfterState ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-surface-container p-3.5 rounded-xl border-l-4 border-emerald-400 text-on-surface">
                      <div className="text-emerald-400 font-bold mb-1">💬 [WhatsApp Comercial - Resposta Automática]</div>
                      "Olá! Seja bem-vindo. Para escolher o melhor dia e horário para seu atendimento, acesse nosso link direto:"
                    </div>

                    <div className="bg-surface-container p-3.5 rounded-xl border-l-4 border-primary text-on-surface">
                      <div className="text-primary font-bold mb-1">📅 [Agendamento Confirmado]</div>
                      ✓ Horário reservado na sua agenda.<br />
                      ✓ Convite enviado automaticamente para o cliente.
                    </div>

                    <div className="bg-surface-container p-3.5 rounded-xl border-l-4 border-sky-400 text-on-surface">
                      <div className="text-sky-400 font-bold mb-1">⚡ [Lembrete Automático]</div>
                      Aviso enviado por WhatsApp 2 horas antes da reunião para evitar faltas!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs opacity-80">
                    <div className="bg-surface-container p-3.5 rounded-xl border-l-4 border-rose-400 text-on-surface">
                      <div className="text-rose-400 font-bold mb-1">❌ [Demora na Resposta]</div>
                      "Oi, você tem horário amanhã?" (sem resposta por 4 horas)
                    </div>
                    <div className="bg-surface-container p-3.5 rounded-xl border-l-4 border-amber-400 text-on-surface">
                      <div className="text-amber-400 font-bold mb-1">⚠️ [Desistência]</div>
                      Cliente desiste por falta de opção rápida e procura concorrente.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
