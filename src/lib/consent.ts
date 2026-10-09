/**
 * Consentimento para medição de acesso (LGPD).
 *
 * O Google Analytics grava cookie no navegador do visitante e envia dados para
 * um terceiro. A LGPD exige base legal para isso, e consentimento é a base que
 * não depende de interpretação. Então a regra aqui é simples: **nada é
 * carregado antes do "aceitar"**.
 *
 * Isso também honra o que a política de privacidade promete ao visitante.
 *
 * Guardado em localStorage e não em cookie: a escolha é por navegador, não
 * precisa ir para o servidor em nenhuma requisição, e cookie para controlar
 * cookie é uma volta desnecessária.
 */

const STORAGE_KEY = 'gr_consentimento_medicao_v1';

export type ConsentState = 'aceito' | 'recusado' | 'pendente';

export function getConsent(): ConsentState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'aceito' || saved === 'recusado') return saved;
  } catch {
    // Navegação privada ou armazenamento bloqueado: trate como pendente e,
    // na prática, nada é medido. Falhar para o lado de não rastrear.
  }
  return 'pendente';
}

export function setConsent(state: 'aceito' | 'recusado'): void {
  try {
    localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Não dá para persistir: a escolha vale para esta sessão e o banner
    // reaparece na próxima. Preferível a insistir em gravar.
  }
  notificar(state);
}

/** Permite ao app reagir na hora do clique, sem recarregar a página. */
type Listener = (state: ConsentState) => void;
const listeners = new Set<Listener>();

export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notificar(state: ConsentState): void {
  listeners.forEach((listener) => listener(state));
}

/**
 * Apaga os cookies que o Google Analytics deixou.
 *
 * Necessário para o caso de quem aceitou e depois recusou: sem isto o `_ga`
 * continuaria no navegador, e "recusar" não teria efeito prático nenhum.
 */
export function limparCookiesDeMedicao(): void {
  if (typeof document === 'undefined') return;

  const dominio = window.location.hostname;
  const dominioRaiz = dominio.split('.').slice(-2).join('.');

  document.cookie.split(';').forEach((entrada) => {
    const nome = entrada.split('=')[0]?.trim();
    if (!nome || !/^(_ga|_gid|_gat|_gcl)/.test(nome)) return;

    [dominio, `.${dominio}`, dominioRaiz, `.${dominioRaiz}`, ''].forEach((escopo) => {
      document.cookie =
        `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
        (escopo ? `; domain=${escopo}` : '');
    });
  });
}
