export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  isPopular?: boolean;
  features: string[];
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
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'E-mail' | 'Telefone' | 'Aleatória';
  pixReceiverName: string;
  meiCnpj: string;
  meiStatus: string;
  meiRazaoSocial: string;
  heroHeadline: string;
  heroSubheadline: string;
}
