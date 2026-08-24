import type { Block, PostSeo } from './types.blocks';

export * from './types.blocks';

export interface Plan {
  id: string;
  name: string;
  /** Nome interno do tier no Offer Triangle (Starter / Core / Premium). */
  internalTier: string;
  /** Valor da configuração. Pagamento único — não há mensalidade. */
  price: number;
  description: string;
  /** Frase de posicionamento destacada no card. Opcional. */
  highlight?: string;
  isPopular?: boolean;
  features: string[];
  /** Período de suporte incluso por WhatsApp. Vazio = não incluso. */
  supportPeriod: string;
  ctaText: string;
  whatsappMessage: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  clientCategory: string;
  timeframe: string;
  summary: string;
  before: {
    status: string;
    points: string[];
  };
  after: {
    status: string;
    points: string[];
  };
  metric: string;
  metricLabel: string;
  badgeText: string;
}

export interface DiagnosticQuestion {
  id: number;
  category: string;
  question: string;
  options: {
    text: string;
    score: number;
    recommendation: string;
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /**
   * Markdown do artigo. Continua sendo a fonte para importar/exportar e o
   * fallback de quem foi salvo antes do editor de blocos, mas quem manda na
   * renderização é `blocks`.
   */
  content: string;
  /** Conteúdo estruturado do editor de blocos. Vazio = converte de `content`. */
  blocks?: Block[];
  category: string;
  /** Palavras-chave secundárias. Viram `keywords` e a lista de tags do artigo. */
  tags?: string[];
  readTime: string;
  publishedAt: string;
  /** Data da última edição. O Google usa para saber que o artigo está vivo. */
  updatedAt?: string;
  author: string;
  featuredImage?: string;
  /** Texto alternativo da imagem destacada. */
  featuredImageAlt?: string;
  seo?: PostSeo;
  isPublished: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  businessType: string;
  source: 'contact_form' | 'diagnostic_checklist';
  diagnosticScore?: number;
  diagnosticDetails?: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  createdAt: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  whatsappWelcomeMessage: string;
  contactEmail: string;
  /** Cidade/região atendida — usada no rodapé e no SEO local. */
  city: string;
  serviceArea: string;
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'E-mail' | 'Telefone' | 'Aleatória';
  pixReceiverName: string;
  /** Deixe vazio enquanto não houver CNPJ real: nada é exibido no site. */
  meiCnpj: string;
  meiStatus: string;
  meiRazaoSocial: string;
  heroHeadline: string;
  heroSubheadline: string;
}

/**
 * Oferta de entrada mostrada acima dos planos (bloco editável no admin).
 *
 * O tipo estava sendo importado por App, PlansEditor e store sem existir em
 * lugar nenhum — o build inteiro falhava por causa disso.
 */
export interface EntryOffer {
  name: string;
  /** Pagamento único, como os planos. */
  price: number;
  deliveryTime: string;
  description: string;
  includes: string[];
  whatsappMessage: string;
}
