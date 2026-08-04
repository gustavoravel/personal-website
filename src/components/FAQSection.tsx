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
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <HelpCircle className="w-4 h-4" />
          <span>Respostas Claras &amp; Sem Enrolação</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
          As dúvidas que <span className="text-primary">todo mundo tem</span> antes de contratar
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Se a sua pergunta não estiver aqui, me mande no WhatsApp. Respondo mesmo que a resposta não me favoreça.
        </p>
      </div>

      {/* Accordion List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-surface-container rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-primary shadow-lg shadow-primary/10' : 'border-outline-variant hover:border-outline'
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                aria-expanded={isOpen}
                className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
              >
                <span className="font-bold text-lg text-on-surface leading-snug">
                  {faq.question}
                </span>
                <div className={`w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-primary text-on-primary' : ''}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-4 text-base text-on-surface-variant leading-relaxed border-t border-outline-variant space-y-3">
                  <p>{faq.answer}</p>
                  {idx === 1 && (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-3.5 py-2 rounded-lg border border-emerald-500/25 text-base font-semibold">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Você continua dono de tudo</span>
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
