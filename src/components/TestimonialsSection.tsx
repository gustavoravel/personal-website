import React from 'react';
import { Testimonial } from '../types';
import { Star, MessageSquareQuote } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>Depoimentos &amp; Reconhecimento</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          O Que Dizem Nossos <span className="text-primary">Parceiros e Clientes</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Profissionais que simplificaram sua tecnologia e transformaram seus atendimentos.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-on-surface italic leading-relaxed">
                "{t.quote}"
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover border border-primary/30 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-on-surface">{t.name}</h4>
                <p className="text-xs text-on-surface-variant">{t.role}</p>
                {t.company && (
                  <span className="text-[10px] text-primary font-semibold">{t.company}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
