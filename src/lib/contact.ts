import { SiteSettings } from '../types';
import { trackWhatsAppClick } from './analytics';

/**
 * Central point for every outbound contact action.
 *
 * Two rules enforced here:
 * 1. Every WhatsApp link carries a pre-filled message (raises reply rate a lot).
 * 2. If the WhatsApp number is not configured yet, we never open a broken
 *    wa.me link — we send the visitor to the contact form instead.
 */

export const hasWhatsApp = (settings: SiteSettings): boolean =>
  Boolean(settings.whatsappNumber && settings.whatsappNumber.replace(/\D/g, '').length >= 12);

export const whatsAppUrl = (settings: SiteSettings, message: string): string | null => {
  if (!hasWhatsApp(settings)) return null;
  const number = settings.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

/**
 * `origem` identifica o botão clicado e vai para o GA4 junto com a conversão.
 * Quando o WhatsApp não está configurado o visitante cai no formulário — e o
 * evento registra isso, para não inflar a conversão com cliques que não
 * viraram conversa.
 */
export const openWhatsApp = (settings: SiteSettings, message: string, origem = 'nao-identificada'): void => {
  const url = whatsAppUrl(settings, message);

  trackWhatsAppClick(origem, { destino: url ? 'whatsapp' : 'formulario' });

  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' });
};

export const mailtoUrl = (settings: SiteSettings, subject: string): string | null =>
  settings.contactEmail ? `mailto:${settings.contactEmail}?subject=${encodeURIComponent(subject)}` : null;

/**
 * Posts a lead to the configured external endpoint (Formspree, Web3Forms,
 * n8n webhook — anything that accepts a JSON POST).
 *
 * Set VITE_LEAD_ENDPOINT in .env to enable. Without it the lead is still
 * stored locally, but nothing reaches Gustavo — so the UI warns about it.
 */
export const LEAD_ENDPOINT: string = import.meta.env.VITE_LEAD_ENDPOINT || '';

export const isLeadEndpointConfigured = Boolean(LEAD_ENDPOINT);

export async function postLead(payload: Record<string, unknown>): Promise<boolean> {
  if (!isLeadEndpointConfigured) return false;

  try {
    const response = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch {
    return false;
  }
}
