/**
 * Google Analytics 4 via `react-ga4`.
 *
 * Por que não a tag no index.html: o site é uma SPA de rota por caminho
 * (ver `src/lib/router.ts`). A tag solta só registra o primeiro carregamento;
 * ir da home para /blog/artigo não gera pageview nenhum, a não ser que o
 * "History changes" esteja ligado na propriedade. Inicializando aqui, o
 * pageview é disparado por nós a cada troca de rota — sem depender de config
 * do painel do GA.
 *
 * Sem VITE_GA_MEASUREMENT_ID no .env, tudo isto vira no-op: o site funciona
 * igual e nada é enviado.
 */
import ReactGA from 'react-ga4';

export const GA_MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export const isAnalyticsConfigured = GA_MEASUREMENT_ID.trim() !== '';

/** Em desenvolvimento os acessos são meus, não de cliente: não poluem o relatório. */
const isEnabled = isAnalyticsConfigured && !import.meta.env.DEV;

let initialized = false;

export function initAnalytics(): void {
  if (initialized || !isEnabled) return;
  ReactGA.initialize(GA_MEASUREMENT_ID);
  initialized = true;
}

/** Chamado a cada troca de rota; `path` já vem com a query/hash quando houver. */
export function trackPageView(path: string, title?: string): void {
  if (!initialized) return;
  ReactGA.send({ hitType: 'pageview', page: path, title });
}

/** Para marcar as ações que valem dinheiro: clique no WhatsApp, envio do diagnóstico. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!initialized) return;
  ReactGA.event(name, params);
}

/**
 * Conversões. No GA4 estes dois eventos precisam ser marcados como
 * "Principais eventos" (Admin → Eventos) para contarem como conversão:
 *
 *   whatsapp_click — clique em qualquer botão que abre o WhatsApp
 *   generate_lead  — formulário enviado (contato ou diagnóstico)
 *
 * `generate_lead` é nome recomendado pelo próprio GA4, então já aparece
 * pronto nos relatórios de aquisição.
 */

/** `origem` diz qual botão converteu (hero, navbar, planos...) — sem isso o relatório só diz "alguém clicou". */
export function trackWhatsAppClick(origem: string, extras?: Record<string, unknown>): void {
  trackEvent('whatsapp_click', { origem, ...extras });
}

/** `formulario`: 'contato' ou 'diagnostico'. */
export function trackLeadSubmit(formulario: string, extras?: Record<string, unknown>): void {
  trackEvent('generate_lead', { formulario, ...extras });
}
