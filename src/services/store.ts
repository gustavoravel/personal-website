import { Plan, CaseStudy, DiagnosticQuestion, BlogPost, FAQItem, Lead, SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Updated plans using human benefit language & non-jargon plan names
export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-essencial',
    name: 'Essencial',
    price: 499,
    period: '/mês',
    description: 'Sua página profissional no ar + WhatsApp comercial organizado para passar confiança imediata.',
    isPopular: false,
    features: [
      'Página simples e bonita com seus serviços, preços e botão de WhatsApp',
      'Perfil comercial do WhatsApp configurado com catálogo e mensagem de saudação',
      'Cartão digital com seus links principais',
      'Seu negócio encontrável no Google quando procurarem pelo seu serviço',
      'Suporte e ajustes direto comigo no WhatsApp'
    ],
    ctaText: 'Escolher Plano Essencial',
    whatsappMessage: 'Olá Gustavo! Quero contratar o plano Essencial para organizar meu WhatsApp e minha página.'
  },
  {
    id: 'plan-completo',
    name: 'Completo',
    price: 999,
    period: '/mês',
    description: 'Seu cliente agenda sozinho por um link 24h por dia e recebe lembretes automáticos antes da reunião.',
    isPopular: true,
    features: [
      'Tudo do plano Essencial',
      'Seu cliente escolhe o horário sozinho por um link — sem você trocar mensagens',
      'Lembrete automático enviado por WhatsApp antes do horário para reduzir faltas',
      'Formulário simples onde o cliente já te manda todas as informações necessárias',
      'Uma tela só onde você vê em que pé está cada atendimento',
      'Resposta em até 4 horas úteis, direto comigo no WhatsApp'
    ],
    ctaText: 'Escolher Plano Completo (Mais Recomendado)',
    whatsappMessage: 'Olá Gustavo! Vi o plano Completo e quero meu agendamento automático rodando em 3 dias úteis!'
  },
  {
    id: 'plan-sob-medida',
    name: 'Sob Medida',
    price: 2499,
    period: '/mês',
    description: 'Tarefas repetitivas acontecendo sozinhas (orçamentos, cobranças e relatórios automáticos).',
    isPopular: false,
    features: [
      'Tudo do plano Completo',
      'Sistema web personalizado para o seu modelo exato de negócio',
      'Envio automático de orçamentos e lembretes de cobrança',
      'Integração direta com meios de pagamento (Pix e cartão)',
      'Acompanhamento semanal e ajustes contínuos de processos'
    ],
    ctaText: 'Falar com Gustavo (Sob Medida)',
    whatsappMessage: 'Olá Gustavo! Tenho um projeto sob medida e gostaria de fazer uma análise personalizada.'
  }
];

// Honest demonstration prototypes instead of fake success statistics
export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    title: 'Como Fica o Agendamento Automático na Prática',
    clientCategory: 'Demonstração de Protótipo',
    timeframe: 'Prazo de 3 dias úteis em contrato',
    summary: 'Demonstração prática de como um profissional autônomo elimina a troca de mensagens repetitivas para marcar horários.',
    before: {
      status: 'Antes: Agendamento Manual Cansativo',
      points: [
        'Troca de até 8 mensagens no WhatsApp para achar um dia vago',
        'Cliente desiste ou esquece do horário por falta de lembrete',
        'Falta de organização entre mensagens pessoais e de trabalho'
      ]
    },
    after: {
      status: 'Depois: Sistema Rodando 24 Horas por Dia',
      points: [
        'WhatsApp comercial com mensagem automática e catálogo de serviços',
        'Link de agendamento onde o próprio cliente escolhe o horário livre na sua agenda',
        'Lembrete automático enviado antes do compromisso para evitar faltas'
      ]
    },
    metric: '24h',
    metricLabel: 'Agendamento no Automático',
    badgeText: 'Demonstração #1'
  },
  {
    id: 'case-2',
    title: 'Como Fica a Qualificação e Envio de Orçamentos',
    clientCategory: 'Demonstração de Protótipo',
    timeframe: 'Prazo de 3 dias úteis em contrato',
    summary: 'Demonstração de como um formulário simples já entrega o cliente qualificado e pronto para fechar.',
    before: {
      status: 'Antes: Perguntas Repetitivas',
      points: [
        'Mensagens soltas do tipo "quanto custa?" sem nenhum detalhe do projeto',
        'Horas perdidas explicando informações básicas uma a uma',
        'Falta de registro centralizado dos clientes atendidos'
      ]
    },
    after: {
      status: 'Depois: Informações Prontas no Seu Painel',
      points: [
        'Formulário simples que coleta o que você precisa saber em 1 minuto',
        'Envio automático dos dados direto para o seu WhatsApp e painel de controle',
        'Organização clara do status de cada atendimento'
      ]
    },
    metric: '1 Tela',
    metricLabel: 'Para Controlar Tudo',
    badgeText: 'Demonstração #2'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    question: 'E se eu não entender nada de tecnologia?',
    answer: 'É exatamente para isso que existo! Você não precisa aprender nada complicado nem entender de código. Eu entrego tudo pronto e configurado para você usar em 3 dias úteis, e te explico passo a passo como mexer.'
  },
  {
    question: 'As contas e ferramentas ficam no meu nome?',
    answer: 'Sim! Esta é a regra principal do meu trabalho: tudo é criado no seu próprio nome e no seu e-mail. Você é o único dono absoluto de toda a sua estrutura. Se um dia quiser parar a consultoria, tudo continua funcionando na sua mão.'
  },
  {
    question: 'Você vai pedir minhas senhas pessoais do WhatsApp?',
    answer: 'Nunca! A configuração do WhatsApp Business e do sistema de agendamento é feita com acessos seguros de integração e autorização na tela do seu próprio celular. Suas conversas e dados pessoais continuam 100% privados e protegidos.'
  },
  {
    question: 'O que acontece se der algum problema após a entrega?',
    answer: 'Eu não sumirei após a entrega. Você tem suporte direto comigo via WhatsApp por 30 dias inclusos para tirar qualquer dúvida ou solicitar ajustes. Se algo não funcionar como combinado, eu refaço sem nenhum custo adicional.'
  },
  {
    question: 'Em quanto tempo meu sistema fica pronto de verdade?',
    answer: 'O prazo padrão é de 3 dias úteis após a nossa conversa inicial de alinhamento. Esse compromisso de entrega rápida é assumido por escrito.'
  },
  {
    question: 'Preciso pagar ferramentas caras de terceiros além do seu serviço?',
    answer: 'Não! Priorizo ferramentas gratuitas ou de baixíssimo custo (como Google Agenda, WhatsApp Business e planos gratuitos do Cal.com). Você não terá surpresas com mensalidades ocultas.'
  },
  {
    question: 'E se eu não gostar do resultado final?',
    answer: 'O trabalho só é considerado concluído quando você testar e aprovar a solução rodando na prática. Se o sistema não funcionar como combinado no nosso diagnóstico, eu refaço ou devolvo o seu investimento.'
  }
];

export const INITIAL_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    category: 'WhatsApp & Atendimento',
    question: 'Como é feito o seu primeiro atendimento hoje quando um cliente entra em contato?',
    options: [
      { text: 'Respondo manualmente no WhatsApp pessoal conforme dá tempo no dia', score: 10, recommendation: 'Configuração urgente do WhatsApp Business com mensagens de saudação e catálogo.' },
      { text: 'Tenho WhatsApp Business mas não uso catálogo nem respostas automáticas', score: 20, recommendation: 'Organização do perfil comercial e mensagens de resposta rápida.' },
      { text: 'Já uso mensagens prontas e qualificadoras para atender o cliente', score: 30, recommendation: 'Integração do WhatsApp com agendamento automático por link.' }
    ]
  },
  {
    id: 2,
    category: 'Agendamento de Horários',
    question: 'Como você marca reuniões ou consultas com seus clientes?',
    options: [
      { text: 'Trocamos várias mensagens negociando dias e horários vagos', score: 10, recommendation: 'Implantação de link de agendamento automático integrado à sua agenda.' },
      { text: 'Mando os horários por texto e anoto num bloco de notas ou papel', score: 20, recommendation: 'Sincronização do Google Agenda com aviso automático anti-faltas.' },
      { text: 'O cliente já escolhe o horário sozinho por um link online', score: 30, recommendation: 'Configurar lembretes automáticos por WhatsApp antes do horário.' }
    ]
  },
  {
    id: 3,
    category: 'Página Web & Apresentação',
    question: 'Onde seu cliente encontra seus preços e serviços detalhados?',
    options: [
      { text: 'Não tenho página, explico tudo digitando por mensagem toda vez', score: 10, recommendation: 'Criação de uma página simples e bonita com seus serviços e preços.' },
      { text: 'Tenho perfil no Instagram mas não tenho um site com botão de WhatsApp', score: 20, recommendation: 'Montagem de página direta focada em conversão para o WhatsApp.' },
      { text: 'Tenho uma página profissional atualizada com preços e contatos', score: 30, recommendation: 'Otimização para aparecer nas buscas do Google quando procurarem seu serviço.' }
    ]
  },
  {
    id: 4,
    category: 'Rotina & Automações',
    question: 'Quanto do seu tempo diário é gasto em tarefas repetitivas?',
    options: [
      { text: 'Mais de 2 horas por dia enviando lembretes, arquivos e cobranças na mão', score: 10, recommendation: 'Automação de lembretes e envios de mensagens repetitivas.' },
      { text: 'Faço algumas tarefas no automático mas as ferramentas não se conversam', score: 20, recommendation: 'Conectar seu WhatsApp à sua agenda e cadastro de clientes.' },
      { text: 'Quase todas as tarefas de rotina já acontecem sozinhas', score: 30, recommendation: 'Aprimorar o acompanhamento pós-venda para novos agendamentos.' }
    ]
  },
  {
    id: 5,
    category: 'Controle de Clientes',
    question: 'Onde ficam anotados os dados e histórico dos seus clientes?',
    options: [
      { text: 'Fica tudo na memória ou dentro das conversas soltas do WhatsApp', score: 10, recommendation: 'Criação de uma tela simples e única para ver em que pé está cada cliente.' },
      { text: 'Anoto numa planilha quando lembro', score: 20, recommendation: 'Automação para enviar cada novo contato direto para sua lista organizada.' },
      { text: 'Uso um painel organizado por etapas de atendimento', score: 30, recommendation: 'Manter histórico atualizado para vender novamente para antigos clientes.' }
    ]
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  whatsappNumber: '5511999999999',
  whatsappWelcomeMessage: 'Olá Gustavo! Vi seu site e gostaria de fazer o diagnóstico gratuito do meu atendimento.',
  pixKey: 'gustavo.ravel@tecnologiasemcomplicacao.com.br',
  pixKeyType: 'E-mail',
  pixReceiverName: 'Gustavo Ravel - Tecnologia Sem Complicação',
  meiCnpj: '48.912.345/0001-90',
  meiStatus: 'MEI Ativo - Optante pelo Simples Nacional',
  meiRazaoSocial: 'GUSTAVO RAVEL DA SILVA TECNOLOGIA MEI',
  heroHeadline: 'Sua tecnologia funcionando — sem você precisar entender de tecnologia',
  heroSubheadline: 'Eu configuro seu WhatsApp, sua agenda online e seus lembretes automáticos em 3 dias úteis. Tudo pronto para usar. Se não funcionar como combinado, eu refaço.'
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Carlos Eduardo',
    email: 'carlos@exemplo.com.br',
    whatsapp: '11988887777',
    businessType: 'Consultoria Financeira',
    source: 'diagnostic_checklist',
    diagnosticScore: 50,
    diagnosticDetails: 'Resultado do Diagnóstico: 50/150 - Necessita de estruturação de WhatsApp Business e Agendamento Automático.',
    status: 'new',
    createdAt: '2026-08-03T14:20:00Z'
  }
];

const STORAGE_KEYS = {
  PLANS: 'gr_plans_v2',
  POSTS: 'gr_posts_v2',
  SETTINGS: 'gr_settings_v2',
  LEADS: 'gr_leads_v2'
};

export class AppStore {
  // Plans
  static getPlans(): Plan[] {
    const cached = localStorage.getItem(STORAGE_KEYS.PLANS);
    return cached ? JSON.parse(cached) : INITIAL_PLANS;
  }

  static savePlans(plans: Plan[]): void {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    const client = supabase;
    if (isSupabaseConfigured && client) {
      plans.forEach(async (p) => {
        await client.from('plans').upsert(p);
      });
    }
  }

  // Blog Posts
  static getPosts(): BlogPost[] {
    const cached = localStorage.getItem(STORAGE_KEYS.POSTS);
    return cached ? JSON.parse(cached) : [];
  }

  static savePosts(posts: BlogPost[]): void {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    const client = supabase;
    if (isSupabaseConfigured && client) {
      posts.forEach(async (p) => {
        await client.from('blog_posts').upsert(p);
      });
    }
  }

  // Settings
  static getSettings(): SiteSettings {
    const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return cached ? JSON.parse(cached) : INITIAL_SETTINGS;
  }

  static saveSettings(settings: SiteSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('site_settings').upsert({ id: 'global', ...settings });
    }
  }

  // Leads
  static getLeads(): Lead[] {
    const cached = localStorage.getItem(STORAGE_KEYS.LEADS);
    return cached ? JSON.parse(cached) : INITIAL_LEADS;
  }

  static addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: 'lead-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString()
    };
    const leads = this.getLeads();
    const updated = [newLead, ...leads];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('leads').insert(newLead);
    }
    return newLead;
  }

  static updateLeadStatus(id: string, status: Lead['status']): void {
    const leads = this.getLeads().map((l) => (l.id === id ? { ...l, status } : l));
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('leads').update({ status }).eq('id', id);
    }
  }
}
