import React from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutGustavoProps {
  settings: SiteSettings;
}

export const AboutGustavo: React.FC<AboutGustavoProps> = ({ settings }) => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Olá Gustavo! Li sua apresentação no site e quero tirar uma dúvida.');
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section id="sobre" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Avatar / Brand Badge Box */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-primary-container/30 to-sky-400/20 border-2 border-primary/40 flex items-center justify-center text-primary shadow-xl">
              <UserCheck className="w-16 h-16" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-on-surface">Gustavo Ravel</h3>
              <p className="text-xs text-primary font-mono uppercase font-bold mt-1">
                Tecnologia Sem Complicação
              </p>
            </div>
          </div>

          {/* Bio & Honest Commitment */}
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quem Vai Mexer nas Suas Ferramentas</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-snug">
              Sem jargão difícil, sem intermediários — você fala <span className="text-primary">direto comigo</span>.
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <p>
                Sou <strong>Gustavo Ravel</strong>. Sei criar soluções tecnológicas completas e, mais importante ainda, sei explicar como tudo funciona de forma simples e direta, sem enrolação ou termos complicados.
              </p>

              <div className="bg-surface-container p-5 rounded-2xl border border-white/10 space-y-2 text-on-surface">
                <div className="font-bold text-sm text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Compromisso de Transparência Total:</span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Não uso fotos de banco de imagem nem depoimentos inventados. O que eu ofereço é transparência: você testa a tecnologia funcionando na minha própria operação antes de contratar e faz o primeiro diagnóstico 100% gratuito.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar Direto com Gustavo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
