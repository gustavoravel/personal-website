export interface Plan {
  id: string;
  name: string;
  /** Valor da implantação, cobrado uma única vez. */
  setupPrice: number;
  /** Valor do acompanhamento mensal. 0 = sem mensalidade. */
  monthlyPrice: number;
  description: string;
  isPopular?: boolean;
  features: string[];
  /** O que a mensalidade cobre todo mês (vazio se não houver mensalidade). */
  monthlyCovers: string[];
  ctaText: string;
  whatsappMessage: string;
}

/** Oferta de entrada barata: serviço avulso, sem mensalidade. */
export interface EntryOffer {
  name: string;
  price: number;
  deliveryTime: string;
  description: string;
  includes: string[];
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
  /** Prazo mínimo de contrato em meses. 0 = sem prazo mínimo. */
  minimumContractMonths: number;
  heroHeadline: string;
  heroSubheadline: string;
}
