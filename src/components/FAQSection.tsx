import React, { useState } from 'react';
import { FAQItem } from '../types';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Open "As contas ficam no meu nome?" by default

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Respostas Claras &amp; Sem Enrolação</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          Perguntas <span className="text-primary">Frequentes</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Tudo o que você precisa saber antes de contratar o seu diagnóstico gratuito.
        </p>
      </div>

      {/* Accordion List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`glass-panel rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-primary bg-surface-container-low/90 shadow-lg shadow-primary/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
              >
                <span className="font-bold text-base md:text-lg text-on-surface leading-snug">
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-primary text-on-primary' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-white/5 space-y-3">
                  <p>{faq.answer}</p>
                  {idx === 1 && (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Garantia de Propriedade Total do Cliente</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
