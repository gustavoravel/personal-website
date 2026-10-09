import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { getConsent, setConsent, type ConsentState } from '../lib/consent';

interface CookieConsentProps {
  /** Abre a política de privacidade sem recarregar a página. */
  onOpenPrivacy: () => void;
}

/**
 * Aviso de medição de acesso.
 *
 * Escrito para o público do site: dono de pequeno negócio, desconfiado, lendo
 * no celular. Por isso não fala "cookies de terceiros para fins analíticos",
 * e sim o que acontece de fato. E as duas opções têm o mesmo peso visual —
 * banner com "aceitar" em destaque e "recusar" escondido num link cinza é
 * consentimento only no nome.
 *
 * Só aparece quando a escolha está pendente, e nada é medido antes do clique.
 */
export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacy }) => {
  const [state, setState] = useState<ConsentState>('pendente');

  // Só decide depois de montar: no HTML estático servido ao robô este bloco
  // não existe, e ler o localStorage durante o render inicial causaria um
  // piscar do banner para quem já respondeu.
  useEffect(() => {
    setState(getConsent());
  }, []);

  if (state !== 'pendente') return null;

  const responder = (resposta: 'aceito' | 'recusado') => {
    setConsent(resposta);
    setState(resposta);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-titulo"
      className="fixed inset-x-0 bottom-0 z-[60] px-gutter pb-4 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-outline-variant bg-surface-container p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-3">
            <h2 id="consent-titulo" className="text-base font-bold text-on-surface">
              Posso contar quantas pessoas visitam o site?
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Uso o Google Analytics só para saber quantas pessoas entram e quais páginas elas
              leem. Não serve para te identificar, e nada é usado para te mostrar anúncio.{' '}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-primary underline hover:no-underline"
              >
                Ver a política de privacidade
              </button>
              .
            </p>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Se preferir que não, o site funciona exatamente igual.
            </p>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={() => responder('aceito')}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02]"
              >
                Pode contar
              </button>
              <button
                type="button"
                onClick={() => responder('recusado')}
                className="rounded-xl border border-outline px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-white/5"
              >
                Prefiro que não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
