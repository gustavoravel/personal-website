import React, { useState } from 'react';
import { DiagnosticQuestion, Plan, SiteSettings } from '../types';
import { AppStore } from '../services/store';
import { openWhatsApp, postLead, isLeadEndpointConfigured } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { trackLeadSubmit } from '../lib/analytics';
import {
  ClipboardCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticChecklistProps {
  questions: DiagnosticQuestion[];
  settings: SiteSettings;
  plans: Plan[];
  onSeePlans: () => void;
}

export const DiagnosticChecklist: React.FC<DiagnosticChecklistProps> = ({
  questions,
  settings,
  plans,
  onSeePlans
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { score: number; text: string; recommendation: string }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadWhatsApp, setLeadWhatsApp] = useState('');
  const [leadBusiness, setLeadBusiness] = useState('');
  const [consent, setConsent] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'error'>('idle');

  const currentQ = questions[currentStep];
  const totalQuestions = questions.length;
  const maxPossibleScore = totalQuestions * 30;
  const totalScore = Object.values(answers).reduce((acc, curr) => acc + curr.score, 0);

  const handleSelectOption = (option: { text: string; score: number; recommendation: string }) => {
    setAnswers({ ...answers, [currentQ.id]: option });

    if (currentStep + 1 < totalQuestions) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsCompleted(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // confete é enfeite: se falhar, o resultado aparece do mesmo jeito
    }
  };

  const getMaturityLevel = (score: number) => {
    if (score <= 60)
      return {
        label: 'Você está perdendo cliente no atendimento',
        color: 'text-rose-200',
        bg: 'bg-rose-500/15 border-rose-500/40'
      };
    if (score <= 110)
      return {
        label: 'Está funcionando, mas dá muito trabalho à mão',
        color: 'text-amber-200',
        bg: 'bg-amber-500/15 border-amber-500/40'
      };
    return {
      label: 'Bem organizado — dá para automatizar o resto',
      color: 'text-emerald-200',
      bg: 'bg-emerald-500/15 border-emerald-500/40'
    };
  };

  const maturity = getMaturityLevel(totalScore);

  /** Encaminha o resultado para o plano correspondente. */
  const recommendedPlan = (): Plan | undefined => {
    if (!plans.length) return undefined;
    if (totalScore <= 60) return plans.find((p) => p.id === 'plan-completo') || plans[1] || plans[0];
    if (totalScore <= 110) return plans.find((p) => p.id === 'plan-essencial') || plans[0];
    return plans.find((p) => p.id === 'plan-equipe') || plans[plans.length - 1];
  };

  const suggested = recommendedPlan();

  const resetChecklist = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setSendState('idle');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || sendState === 'sending') return;

    setSendState('sending');

    const recs = Object.values(answers).map((ans) => `• ${ans.recommendation}`).join('\n');
    const details = `Pontuação: ${totalScore}/${maxPossibleScore}\nSituação: ${maturity.label}\nPlano sugerido: ${suggested?.name || 'a definir'}\nRecomendações:\n${recs}`;

    const lead = {
      name: leadName || 'Cliente',
      email: '',
      whatsapp: leadWhatsApp,
      businessType: leadBusiness || 'Não informado',
      source: 'diagnostic_checklist' as const,
      diagnosticScore: totalScore,
      diagnosticDetails: details,
      message: 'Pediu análise do diagnóstico gratuito pelo site.'
    };

    const { savedRemotely } = await AppStore.addLead(lead);
    const webhookOk = isLeadEndpointConfigured ? await postLead(lead) : false;

    // O WhatsApp abre de qualquer jeito logo abaixo — o aviso serve só para
    // o visitante saber que precisa mesmo enviar a mensagem por lá.
    const ok = webhookOk || savedRemotely;
    setSendState(ok ? 'idle' : 'error');

    if (ok) trackLeadSubmit('diagnostico', { pontuacao: totalScore, situacao: maturity.label });

    openWhatsApp(
      settings,
      `Olá Gustavo! Fiz o diagnóstico gratuito no seu site.\n\nNome: ${leadName || 'cliente'}\nO que eu faço: ${leadBusiness || 'não informado'}\nResultado: ${totalScore} de ${maxPossibleScore}\nSituação: ${maturity.label}\n\nQuero conversar sobre as recomendações.`,
      'diagnostico'
    );
  };

  const inputClass =
    'w-full bg-surface-container p-3.5 rounded-lg border border-outline-variant text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none';

  return (
    <section id="diagnostico" className="py-16 px-gutter max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <ClipboardCheck className="w-4 h-4" />
          <span>Diagnóstico Gratuito</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          Descubra onde você está <span className="text-primary">perdendo cliente</span>
        </h2>
        {/* Diz antes de começar o que a pessoa recebe no fim. */}
        <p className="text-on-surface-variant text-lg leading-relaxed">
          São 5 perguntas e leva 1 minuto. No fim você vê, na tela, os pontos do seu atendimento que mais te fazem perder cliente
          e o que dá para resolver primeiro. Não precisa informar nada de contato para ver o resultado.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {!isCompleted ? (
          <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4 text-base font-semibold text-on-surface-variant">
                <span>
                  Pergunta {currentStep + 1} de {totalQuestions} · {currentQ.category}
                </span>
                <span className="text-primary">{Math.round(((currentStep + 1) / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-base text-primary hover:underline flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para a anterior</span>
                </button>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-on-surface leading-snug">
              {currentQ.question}
            </h3>

            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full text-left p-5 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary hover:bg-surface-container-high transition-all duration-200 group flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full border border-primary/40 text-primary flex items-center justify-center font-bold text-base shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-base font-medium text-on-surface leading-relaxed pt-1">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Resultado aparece PRIMEIRO. O contato é pedido depois do valor entregue. */
          <div className="bg-surface-container p-8 md:p-10 rounded-2xl border border-primary/40 glow-accent space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-200 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/25">
                <Sparkles className="w-4 h-4" />
                <span>Seu resultado</span>
              </div>

              <h3 className="text-3xl font-extrabold text-on-surface">
                {totalScore} de {maxPossibleScore} pontos
              </h3>

              <div className={`inline-block px-5 py-3 rounded-xl text-base md:text-lg font-bold border ${maturity.bg} ${maturity.color}`}>
                {maturity.label}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-outline-variant">
              <h4 className="text-lg font-bold text-on-surface">
                O que está te custando cliente hoje — e o que resolver primeiro:
              </h4>

              <div className="space-y-3">
                {Object.entries(answers).map(([id, ans]) => (
                  <div key={id} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-base text-on-surface leading-relaxed">{ans.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Encaminha automaticamente para o plano correspondente */}
            {suggested && (
              <div className="bg-surface-container-low p-6 rounded-xl border border-primary/30 space-y-3">
                <div className="flex items-center gap-2 text-base font-bold text-primary">
                  <Tag className="w-5 h-5" />
                  <span>Pelo seu resultado, o que faz sentido é o plano {suggested.name}</span>
                </div>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  {suggested.description} R$ {suggested.price.toLocaleString('pt-BR')}, pagamento único, pronto em até 7 dias
                  {suggested.supportPeriod && `, com ${suggested.supportPeriod} de suporte incluso`}.
                </p>
                <button
                  onClick={onSeePlans}
                  className="inline-flex items-center gap-2 text-primary hover:underline font-bold text-base"
                >
                  <span>Ver o que está incluído nesse plano</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-on-surface text-lg">
                  <WhatsAppIcon className="w-5 h-5 text-emerald-400" />
                  <span>Quer que eu te mande esse diagnóstico e um plano de correção?</span>
                </div>
                <p className="text-base text-on-surface-variant">
                  Opcional. Você já viu o resultado acima — isto é só se quiser conversar sobre ele.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="diag-name" className="block text-base font-semibold text-on-surface mb-1.5">
                    Seu nome
                  </label>
                  <input
                    id="diag-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="diag-whatsapp" className="block text-base font-semibold text-on-surface mb-1.5">
                    Seu WhatsApp
                  </label>
                  <input
                    id="diag-whatsapp"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    value={leadWhatsApp}
                    onChange={(e) => setLeadWhatsApp(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="diag-business" className="block text-base font-semibold text-on-surface mb-1.5">
                    O que você faz
                  </label>
                  <input
                    id="diag-business"
                    type="text"
                    value={leadBusiness}
                    onChange={(e) => setLeadBusiness(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="diag-consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded bg-surface-container border-outline text-primary focus:ring-0 shrink-0"
                />
                <label htmlFor="diag-consent" className="text-base text-on-surface-variant leading-snug">
                  Concordo que Gustavo use estes dados apenas para me responder sobre este diagnóstico.{' '}
                  <a href="#privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </label>
              </div>

              {sendState === 'error' && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-base flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Não consegui registrar o envio, mas abri o WhatsApp com o seu resultado — pode enviar por lá.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="submit"
                  disabled={!consent || sendState === 'sending'}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 text-base transition-colors disabled:opacity-50"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>{sendState === 'sending' ? 'Enviando...' : 'Quero receber pelo WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={resetChecklist}
                  className="bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface px-5 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Refazer</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
