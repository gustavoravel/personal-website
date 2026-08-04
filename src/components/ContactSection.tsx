import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { AppStore } from '../services/store';
import { Mail, MessageCircle, Send, CheckCircle2, User, Phone, Briefcase, Lock } from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;

    AppStore.addLead({
      name,
      email,
      whatsapp,
      businessType,
      source: 'contact_form',
      message
    });

    setSubmitted(true);
  };

  const openDirectWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá Gustavo! Gostaria de agendar o meu diagnóstico gratuito.\n\n*Nome:* ${name || 'Cliente'}\n*Atuação:* ${businessType || 'Autônomo'}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section id="contato" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Info Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Mail className="w-3.5 h-3.5" />
              <span>Contato Direto com Gustavo</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
              Pronto para Colocar Sua <span className="text-primary">Tecnologia no Automático?</span>
            </h2>

            <p className="text-on-surface-variant text-base leading-relaxed">
              Preencha os campos ao lado para agendarmos o seu diagnóstico gratuito de 15 minutos ou chame direto no WhatsApp.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant font-semibold">Atendimento Rápido:</div>
                  <div className="text-sm font-bold text-on-surface">WhatsApp Direto com Gustavo Ravel</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center border border-primary/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant font-semibold">Garantia de Privacidade:</div>
                  <div className="text-sm font-bold text-on-surface">Seus dados não serão compartilhados com ninguém</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 glass-panel p-6 md:p-8 rounded-2xl border border-white/10">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                      E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-whatsapp" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                      WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                      <input
                        id="contact-whatsapp"
                        type="text"
                        required
                        placeholder="(11) 99999-9999"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-business" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Seu Negócio / Área de Atuação
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                    <input
                      id="contact-business"
                      type="text"
                      placeholder="Ex: Psicologia / Consultoria / Reparos"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Mensagem (Opcional)
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    placeholder="Descreva o que gostaria de organizar..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-surface-container p-4 rounded-xl border border-white/10 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                {/* LGPD Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    id="contact-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 rounded bg-surface-container border-white/20 text-primary focus:ring-0"
                  />
                  <label htmlFor="contact-consent" className="text-xs text-on-surface-variant leading-tight">
                    Ao enviar, você concorda que usarei seus dados apenas para responder a este contato de atendimento.
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!consent}
                    className="w-full sm:w-1/2 bg-primary text-on-primary font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitação</span>
                  </button>

                  <button
                    type="button"
                    onClick={openDirectWhatsApp}
                    className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chamar no WhatsApp</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Mensagem Recebida com Sucesso!</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Obrigado pelo contato! Gustavo Ravel responderá em até 4 horas úteis.
                </p>
                <button
                  onClick={openDirectWhatsApp}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Acelerar Atendimento no WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
