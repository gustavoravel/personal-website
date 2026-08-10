export interface Plan {
  id: string;
  name: string;
  /** Nome interno do tier no Offer Triangle (Starter / Core / Premium). */
  internalTier: string;
  /** Valor da configuração. Pagamento único — não há mensalidade. */
  price: number;
  description: string;
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
  content: string;
  category: string;
  readTime: string;
  publishedAt: string;
  author: string;
  featuredImage?: string;
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
