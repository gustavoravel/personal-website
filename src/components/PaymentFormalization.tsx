import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { CreditCard, QrCode, Copy, Check, FileCheck, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

interface PaymentFormalizationProps {
  settings: SiteSettings;
}

export const PaymentFormalization: React.FC<PaymentFormalizationProps> = ({ settings }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="formalizacao" className="py-20 px-gutter max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Segurança &amp; Transparência Financeira</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
          Recebimento Simplificado &amp; <span className="text-primary">Formalização MEI</span>
        </h2>
        <p className="text-on-surface-variant text-base">
          Sem travas burocráticas: cobrança rápida via Pix, contrato enxuto e formalização fiscal pronta para emissão de nota.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Formas de Pagamento & Chave Pix */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Pagamento via Pix (Sem Taxas)</h3>
                <p className="text-xs text-on-surface-variant">Confirmação imediata e início no mesmo dia</p>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Para novos projetos, trabalhamos com o modelo tradicional de <strong className="text-on-surface">50% de entrada</strong> na aprovação da proposta e <strong className="text-on-surface">50% após a entrega final</strong> testada.
            </p>

            {/* Pix Key Display Box */}
            <div className="bg-surface-container p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                <span>Chave Pix ({settings.pixKeyType}):</span>
                <span className="text-primary">{settings.pixReceiverName}</span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-lg border border-white/5 font-mono text-sm text-primary overflow-hidden">
                <span className="truncate">{settings.pixKey}</span>
                <button
                  onClick={handleCopyPix}
                  className="bg-primary/20 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-on-surface-variant flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Emitimos comprovantes de pagamento e nota fiscal em todos os serviços.</span>
          </div>
        </div>

        {/* Card 2: Status MEI & Formalização */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Formalização Mínima Pronta</h3>
                <p className="text-xs text-on-surface-variant">MEI registrado e seguro</p>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Você não precisa esperar ter uma grande empresa para começar com profissionalismo. Nosso CNPJ MEI permite assinar termos de serviço e emitir notas para empresas e pessoas físicas.
            </p>

            {/* MEI Details Grid */}
            <div className="bg-surface-container p-4 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-on-surface-variant">CNPJ:</span>
                <span className="text-on-surface font-bold">{settings.meiCnpj}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-on-surface-variant">Razão Social:</span>
                <span className="text-on-surface font-bold truncate max-w-[200px]">
                  {settings.meiRazaoSocial}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-on-surface-variant">Situação Cadastral:</span>
                <span className="text-emerald-400 font-bold">{settings.meiStatus}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-on-surface-variant flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Dica para novos autônomos: MEI é gratuito, rápido e pode ser aberto em minutos!</span>
          </div>
        </div>
      </div>
    </section>
  );
};
