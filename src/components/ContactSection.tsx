import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { AppStore } from '../services/store';
import { openWhatsApp, hasWhatsApp, mailtoUrl, postLead, isLeadEndpointConfigured } from '../lib/contact';
import { isSupabaseConfigured } from '../lib/supabase';
import { Mail, MessageCircle, Send, CheckCircle2, User, Phone, Briefcase, Lock, AlertTriangle } from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || status === 'sending') return;

    setStatus('sending');

    const lead = { name, email, whatsapp, businessType, source: 'contact_form' as const, message };

    // Guarda local sempre (não perde o contato se a rede falhar) e tenta o
    // Supabase, quando configurado.
    const { savedRemotely } = await AppStore.addLead(lead);

    // Só é sucesso se o contato saiu do navegador por algum caminho:
    // webhook (n8n/Formspree) ou Supabase. Caso contrário, não finja.
    const webhookOk = isLeadEndpointConfigured
      ? await postLead({ ...lead, origem: 'Formulário de contato do site' })
      : false;

    setStatus(webhookOk || savedRemotely ? 'sent' : 'error');
  };

  const emailHref = mailtoUrl(settings, 'Contato pelo site');

  const inputClass =
    'w-full bg-surface-container pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none';

  return (
    <section id="contato" className="py-16 px-gutter max-w-[1200px] mx-auto">
      <div className="bg-surface-container-low rounded-3xl p-8 md:p-12 border border-outline-variant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
              <Mail className="w-4 h-4" />
              <span>Falar com Gustavo</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
              Me conte o que está <span className="text-primary">te dando trabalho hoje</span>
            </h2>

            <p className="text-on-surface-variant text-lg leading-relaxed">
              Preencha ao lado e eu te respondo. A primeira conversa é gratuita, dura cerca de 15 minutos e não tem compromisso nenhum de contratar.
            </p>

            <div className="space-y-5 pt-4 border-t border-outline-variant">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-on-surface">Quem responde é eu mesmo</div>
                  <div className="text-base text-on-surface-variant">Sem robô, sem equipe de suporte no meio</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/30 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-on-surface">Seus dados ficam comigo</div>
                  <div className="text-base text-on-surface-variant">
                    Uso só para te responder. Nunca repasso a ninguém.{' '}
                    <a href="#privacidade" className="text-primary hover:underline">
                      Ver política de privacidade
                    </a>
                  </div>
                </div>
              </div>

              {emailHref && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center border border-sky-500/30 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-on-surface">Prefere e-mail?</div>
                    <a href={emailHref} className="text-base text-primary hover:underline break-all">
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            {status !== 'sent' ? (
              <form onSubmit={handleSubmit} className="space-y-5 bg-surface-container p-6 md:p-8 rounded-2xl border border-outline-variant">
                {/* Visível só em desenvolvimento: o visitante nunca vê isto.
                    Sem VITE_LEAD_ENDPOINT nenhum lead chega até você. */}
                {import.meta.env.DEV && !isLeadEndpointConfigured && !isSupabaseConfigured && (
                  <div className="bg-rose-500/15 border border-rose-500/40 text-rose-100 p-4 rounded-xl text-base">
                    <strong>Aviso de configuração (só aparece em desenvolvimento):</strong> defina{' '}
                    <code>VITE_LEAD_ENDPOINT</code> no arquivo <code>.env</code> antes de publicar. Enquanto isso,
                    os envios ficam só no navegador e não chegam até você.
                  </div>
                )}

                <div>
                  <label htmlFor="contact-name" className="block text-base font-bold text-on-surface mb-2">
                    Seu nome *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-4" />
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Como você quer ser chamado"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-whatsapp" className="block text-base font-bold text-on-surface mb-2">
                      Seu WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-4" />
                      <input
                        id="contact-whatsapp"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="(11) 99999-9999"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-base font-bold text-on-surface mb-2">
                      Seu e-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-4" />
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-business" className="block text-base font-bold text-on-surface mb-2">
                    O que você faz
                  </label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-4" />
                    <input
                      id="contact-business"
                      type="text"
                      placeholder="Ex: salão, consultório, oficina, consultoria"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-base font-bold text-on-surface mb-2">
                    O que está te dando trabalho (opcional)
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    placeholder="Ex: passo o dia respondendo as mesmas perguntas no WhatsApp"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-surface-container p-4 rounded-xl border border-outline-variant text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input
                    id="contact-consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded bg-surface-container border-outline text-primary focus:ring-0 shrink-0"
                  />
                  <label htmlFor="contact-consent" className="text-base text-on-surface-variant leading-snug">
                    Ao enviar, você concorda que eu use seus dados apenas para responder este contato.{' '}
                    <a href="#privacidade" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>
                  </label>
                </div>

                {status === 'error' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-base flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>
                      Não consegui enviar sua mensagem agora.{' '}
                      {hasWhatsApp(settings)
                        ? 'Me chame no WhatsApp pelo botão abaixo — respondo por lá na hora.'
                        : 'Tente novamente em alguns minutos.'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={!consent || status === 'sending'}
                    className="w-full sm:flex-1 bg-primary text-on-primary font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-base hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-5 h-5" />
                    <span>{status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsApp(
                        settings,
                        `Olá Gustavo! Quero meu diagnóstico gratuito.\n\nNome: ${name || '(não informado)'}\nO que eu faço: ${businessType || '(não informado)'}`
                      )
                    }
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-base transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-surface-container p-8 rounded-2xl border border-emerald-500/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Mensagem enviada!</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Recebi seu contato, {name || 'obrigado'}. Eu mesmo respondo em até 4 horas úteis, no WhatsApp que você informou.
                </p>
                <button
                  onClick={() =>
                    openWhatsApp(settings, `Olá Gustavo! Acabei de enviar o formulário no site. Meu nome é ${name || 'cliente'}.`)
                  }
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-emerald-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Não quero esperar, falar agora</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
