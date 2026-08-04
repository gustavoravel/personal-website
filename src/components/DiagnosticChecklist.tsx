import React, { useState } from 'react';
import { DiagnosticQuestion, SiteSettings } from '../types';
import { AppStore } from '../services/store';
import { ClipboardCheck, ArrowRight, RotateCcw, MessageCircle, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticChecklistProps {
  questions: DiagnosticQuestion[];
  settings: SiteSettings;
}

export const DiagnosticChecklist: React.FC<DiagnosticChecklistProps> = ({ questions, settings }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, { score: number; text: string; recommendation: string }>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>('');
  const [leadWhatsApp, setLeadWhatsApp] = useState<string>('');
  const [leadBusiness, setLeadBusiness] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const currentQ = questions[currentStep];
  const totalQuestions = questions.length;

  const handleSelectOption = (option: { text: string; score: number; recommendation: string }) => {
    const updated = {
      ...answers,
      [currentQ.id]: option
    };
    setAnswers(updated);

    if (currentStep + 1 < totalQuestions) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalScore = (): number => {
    return Object.values(answers).reduce((acc, curr) => acc + curr.score, 0);
  };

  const maxPossibleScore = totalQuestions * 30;
  const totalScore = calculateTotalScore();
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

  const getMaturityLevel = (score: number) => {
    if (score <= 60) return { label: 'Atenção (Perdendo Clientes no Atendimento)', color: 'text-rose-300', bg: 'bg-rose-500/20 border-rose-500/30' };
    if (score <= 110) return { label: 'Intermediário (Oportunidade de Automatizar)', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/30' };
    return { label: 'Excelente (Pronto para Crescer)', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30' };
  };

  const maturity = getMaturityLevel(totalScore);

  const resetChecklist = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setSubmitted(false);
  };

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recs = Object.entries(answers)
      .map(([id, ans]) => `• ${ans.recommendation}`)
      .join('\n');

    const details = `Pontuação: ${totalScore}/${maxPossibleScore} (${percentage}%)\nNível: ${maturity.label}\nRecomendações:\n${recs}`;

    AppStore.addLead({
      name: leadName || 'Cliente',
      email: '',
      whatsapp: leadWhatsApp || 'Não informado',
      businessType: leadBusiness || 'Pequeno Negócio',
      source: 'diagnostic_checklist',
      diagnosticScore: totalScore,
      diagnosticDetails: details,
      message: 'Solicitou análise do diagnóstico gratuito via site.'
    });

    setIsSubmitting(false);
    setSubmitted(true);

    const waText = encodeURIComponent(
      `Olá Gustavo! Fiz o Diagnóstico Gratuito no seu site.\n\n*Nome:* ${leadName || 'Cliente'}\n*Atuação:* ${leadBusiness || 'Autônomo'}\n*Resultado:* ${totalScore}/${maxPossibleScore} (${percentage}%)\n*Nível:* ${maturity.label}\n\nGostaria de agendar 15 minutos para analisar minhas recomendações!`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${waText}`, '_blank');
  };

  return (
    <section id="diagnostico" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Diagnóstico Gratuito em 1 Minuto</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          Descubra os <span className="text-primary">Gargalos do Seu Atendimento</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Responda a 5 perguntas rápidas e veja na tela o diagnóstico exato e o que você precisa ajustar.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {!isCompleted ? (
          /* Wizard Progress & Questions */
          <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8">
            {/* Progress Bar & Navigation */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePreviousStep}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>
                  )}
                  <span>Passo {currentStep + 1} de {totalQuestions}: {currentQ.category}</span>
                </div>
                <span className="text-primary">{Math.round(((currentStep + 1) / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                Pergunta #{currentQ.id}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-on-surface leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full text-left p-5 rounded-xl glass-panel border border-white/10 hover:border-primary hover:bg-surface-container-high transition-all duration-200 group flex items-start gap-4"
                >
                  <div className="w-7 h-7 rounded-full border border-primary/40 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {opt.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Results Displayed FIRST on Screen */
          <div className="glass-panel p-8 md:p-10 rounded-2xl border border-primary/40 glow-accent space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
                <span>Seu Resultado Está Pronto na Tela</span>
              </div>

              <h3 className="text-3xl font-extrabold text-on-surface">
                Sua Pontuação: <span className="text-primary">{totalScore} / {maxPossibleScore}</span>
              </h3>

              <div className={`inline-block px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border ${maturity.bg} ${maturity.color}`}>
                Status do Negócio: {maturity.label}
              </div>
            </div>

            {/* Recommendations Shown Directly to User First */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                Pontos de Melhoria Identificados no Seu Atendimento:
              </h4>

              <div className="space-y-3">
                {Object.entries(answers).map(([id, ans]) => (
                  <div key={id} className="bg-surface-container p-4 rounded-xl border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                      {ans.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Form to Send Analysis via WhatsApp */}
            <form onSubmit={handleSendToWhatsApp} className="bg-surface-container-high p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 font-bold text-on-surface text-sm sm:text-base">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>Quer conversar com Gustavo sobre estas recomendações?</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="bg-surface-container p-3 rounded-lg border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Seu WhatsApp (com DDD)"
                  required
                  value={leadWhatsApp}
                  onChange={(e) => setLeadWhatsApp(e.target.value)}
                  className="bg-surface-container p-3 rounded-lg border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Sua Área de Atuação"
                  value={leadBusiness}
                  onChange={(e) => setLeadBusiness(e.target.value)}
                  className="bg-surface-container p-3 rounded-lg border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Análise no WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={resetChecklist}
                  className="w-full sm:w-auto glass-panel text-on-surface-variant hover:text-on-surface px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refazer Diagnóstico</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
