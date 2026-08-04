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
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
          <Award className="w-4 h-4" />
          <span>Montagem de Demonstração</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Demonstração: <span className="text-primary">como fica o seu atendimento depois</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Veja a diferença entre responder tudo na mão e ter o atendimento organizado sozinho.
        </p>
        <p className="text-base text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3.5 inline-block leading-relaxed">
          <strong>Importante:</strong> isto é uma montagem de demonstração feita por mim, não um cliente real.
          Quando eu tiver caso de cliente, ele aparece aqui com nome e autorização.
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
            className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all ${
              activeTab === cs.id
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:text-on-surface'
            }`}
          >
            {cs.badgeText}
          </button>
        ))}
      </div>

      {/* Active Case Card */}
      {activeCase && (
        <div className="bg-surface-container-low rounded-2xl p-8 md:p-10 border border-outline-variant space-y-8">
          {/* Top Banner Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-base text-primary font-semibold mb-2">
                <span>{activeCase.clientCategory}</span>
                <span aria-hidden="true">•</span>
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <Clock className="w-4 h-4" />
                  {activeCase.timeframe}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface">
                {activeCase.title}
              </h3>
              <p className="text-base md:text-lg text-on-surface-variant mt-2.5 max-w-2xl leading-relaxed">
                {activeCase.summary}
              </p>
            </div>

            <div className="bg-surface-container border border-primary/30 p-5 rounded-xl text-center shrink-0 min-w-[170px]">
              <div className="text-2xl md:text-3xl font-extrabold text-primary">{activeCase.metric}</div>
              <div className="text-base text-on-surface-variant font-semibold mt-1">
                {activeCase.metricLabel}
              </div>
            </div>
          </div>

          {/* Interactive Before/After Toggle */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-base font-bold text-on-surface">
                Compare os dois jeitos:
              </span>

              <div className="bg-surface-container p-1.5 rounded-xl flex gap-1.5 border border-outline-variant">
                <button
                  onClick={() => setShowAfterState(false)}
                  aria-pressed={!showAfterState}
                  className={`px-4 py-2.5 rounded-lg text-base font-bold transition-all ${
                    !showAfterState
                      ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Como é hoje
                </button>
                <button
                  onClick={() => setShowAfterState(true)}
                  aria-pressed={showAfterState}
                  className={`px-4 py-2.5 rounded-lg text-base font-bold transition-all ${
                    showAfterState
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Como fica depois
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
                      <li key={idx} className="flex items-start gap-3 text-base text-on-surface leading-relaxed">
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
              {/* Visual de conversa de WhatsApp — linguagem que o cliente
                  reconhece, no lugar do bloco que parecia terminal. */}
              <div className="p-5 rounded-xl border border-outline-variant space-y-4 bg-surface-container-lowest">
                <div className="flex items-center gap-2 text-base font-semibold text-on-surface border-b border-outline-variant pb-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>A conversa do seu cliente</span>
                </div>

                {showAfterState ? (
                  <div className="space-y-3">
                    <div className="bg-surface-container p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-base text-on-surface leading-relaxed">
                      Oi, você tem horário essa semana?
                    </div>

                    <div className="bg-emerald-900/40 border border-emerald-500/30 p-4 rounded-2xl rounded-tr-sm max-w-[90%] ml-auto text-base text-on-surface leading-relaxed">
                      Oi! Que bom te ver por aqui. Escolha o dia e a hora que ficam melhores para você neste link:
                      <span className="block mt-1.5 text-emerald-300 underline">agenda.seunegocio.com.br</span>
                      <span className="block text-sm text-on-surface-variant mt-2">Resposta automática · saiu em 2 segundos</span>
                    </div>

                    <div className="bg-surface-container p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-base text-on-surface leading-relaxed">
                      Marquei quinta às 15h, obrigado!
                    </div>

                    <div className="bg-emerald-900/40 border border-emerald-500/30 p-4 rounded-2xl rounded-tr-sm max-w-[90%] ml-auto text-base text-on-surface leading-relaxed">
                      Confirmado, quinta às 15h. Vou te lembrar 2 horas antes.
                      <span className="block text-sm text-on-surface-variant mt-2">
                        Horário já reservado na sua agenda · lembrete programado
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-surface-container p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-base text-on-surface leading-relaxed">
                      Oi, você tem horário essa semana?
                    </div>

                    <div className="text-base text-rose-200 bg-rose-950/30 border border-rose-500/30 p-4 rounded-xl leading-relaxed">
                      Você estava atendendo e só viu a mensagem 4 horas depois.
                    </div>

                    <div className="bg-surface-container p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-base text-on-surface-variant leading-relaxed">
                      Deixa pra próxima, já resolvi com outra pessoa.
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
