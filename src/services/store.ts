import { Plan, EntryOffer, CaseStudy, DiagnosticQuestion, BlogPost, FAQItem, Lead, SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Preços separados em implantação (uma vez) + acompanhamento mensal opcional.
 * O visitante leigo lia "R$ 999 por mês para sempre" e saía da página.
 */
export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-essencial',
    name: 'Essencial',
    setupPrice: 499,
    monthlyPrice: 99,
    description: 'Sua página profissional no ar + WhatsApp comercial organizado para passar confiança imediata.',
    isPopular: false,
    features: [
      'Página simples e bonita com seus serviços, preços e botão de WhatsApp',
      'Perfil comercial do WhatsApp configurado com catálogo e mensagem de saudação',
      'Cartão digital com seus links principais',
      'Seu negócio encontrável no Google quando procurarem pelo seu serviço',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    monthlyCovers: [
      'Hospedagem da sua página paga por mim',
      'Alterações de texto, preço e serviço quando você pedir',
      'Conserto sem custo se alguma coisa parar de funcionar'
    ],
    ctaText: 'Quero o Essencial',
    whatsappMessage: 'Olá Gustavo! Quero contratar o plano Essencial para organizar meu WhatsApp e minha página.'
  },
  {
    id: 'plan-completo',
    name: 'Completo',
    setupPrice: 999,
    monthlyPrice: 149,
    description: 'Seu cliente agenda sozinho por um link 24h por dia e recebe lembretes automáticos antes do horário.',
    isPopular: true,
    features: [
      'Tudo do plano Essencial',
      'Seu cliente escolhe o horário sozinho por um link — sem você trocar mensagens',
      'Lembrete automático enviado por WhatsApp antes do horário para reduzir faltas',
      'Formulário simples onde o cliente já te manda todas as informações necessárias',
      'Uma tela só onde você vê em que pé está cada atendimento',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    monthlyCovers: [
      'Tudo do acompanhamento Essencial',
      'Acompanho se os lembretes estão saindo e conserto se falhar',
      'Resposta em até 4 horas úteis, direto comigo no WhatsApp'
    ],
    ctaText: 'Quero o Completo',
    whatsappMessage: 'Olá Gustavo! Vi o plano Completo e quero meu agendamento automático rodando em 3 dias úteis!'
  },
  {
    id: 'plan-sob-medida',
    name: 'Sob Medida',
    setupPrice: 2499,
    monthlyPrice: 249,
    description: 'Tarefas repetitivas acontecendo sozinhas: orçamentos, cobranças e relatórios sem você digitar nada.',
    isPopular: false,
    features: [
      'Tudo do plano Completo',
      'Sistema feito para o seu jeito exato de trabalhar',
      'Envio automático de orçamentos e lembretes de cobrança',
      'Recebimento por Pix e cartão ligado direto no seu atendimento',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    monthlyCovers: [
      'Tudo do acompanhamento Completo',
      'Ajustes contínuos conforme seu negócio muda',
      'Conversa de acompanhamento uma vez por mês'
    ],
    ctaText: 'Conversar sobre o Sob Medida',
    whatsappMessage: 'Olá Gustavo! Tenho um projeto sob medida e gostaria de fazer uma análise personalizada.'
  }
];

/** Porta de entrada barata para quem não compra recorrência no primeiro contato. */
export const INITIAL_ENTRY_OFFER: EntryOffer = {
  name: 'Arrumo seu WhatsApp Business em 1 dia',
  price: 249,
  deliveryTime: '1 dia útil',
  description:
    'Serviço avulso, pagamento único, sem mensalidade e sem compromisso. É a forma mais barata de me testar antes de contratar qualquer plano.',
  includes: [
    'Perfil comercial configurado com seus horários, endereço e descrição',
    'Catálogo com seus serviços e preços dentro do WhatsApp',
    'Mensagem de saudação e de ausência automáticas',
    'Até 10 respostas rápidas para as perguntas que você mais recebe',
    'Explicação em vídeo curto de como mexer em tudo depois'
  ],
  whatsappMessage:
    'Olá Gustavo! Quero o serviço avulso de arrumar meu WhatsApp Business em 1 dia (R$ 249).'
};

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
    question: 'Se eu cancelar o acompanhamento depois de 2 meses, o que continua funcionando?',
    answer: 'Continua funcionando praticamente tudo: seu WhatsApp comercial, seu link de agendamento, sua agenda e seus lembretes ficam de pé, porque estão nas suas próprias contas. Você só perde o meu acompanhamento — ou seja, os ajustes e a manutenção passam a ser por conta sua. A única exceção é a hospedagem da página, que hoje é paga por mim dentro da mensalidade: se você cancelar, ou assume esse custo (hoje na faixa de R$ 15 a R$ 30 por mês) ou eu te entrego os arquivos para levar para onde quiser. Não existe prazo mínimo nem multa.'
  },
  {
    question: 'O que acontece se der algum problema após a entrega?',
    answer: 'Eu não sumirei após a entrega. Você tem suporte direto comigo via WhatsApp por 30 dias inclusos para tirar qualquer dúvida ou solicitar ajustes, e o acompanhamento mensal (se você contratar) cobre isso de forma contínua. Se algo não funcionar como combinado, eu refaço sem nenhum custo adicional.'
  },
  {
    question: 'Em quanto tempo meu sistema fica pronto de verdade?',
    answer: 'O prazo padrão é de 3 dias úteis após a nossa conversa inicial de alinhamento, contados de quando você me passar as informações que eu preciso (seus serviços, preços e horários). Esse compromisso de entrega é assumido por escrito.'
  },
  {
    question: 'Preciso pagar ferramentas caras de terceiros além do seu serviço?',
    answer: 'Não. Eu monto tudo em cima de ferramentas gratuitas ou de custo muito baixo: WhatsApp Business é gratuito, Google Agenda é gratuito e o agendamento online roda no plano gratuito. A hospedagem da sua página está inclusa na mensalidade enquanto você tiver acompanhamento comigo. Se em algum momento o seu caso exigir uma ferramenta paga, eu te aviso o valor antes de contratar — nunca aparece uma cobrança que você não aprovou.'
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

/**
 * ATENÇÃO: os campos abaixo que estão vazios são dados reais que só você tem.
 * Enquanto estiverem vazios, o site simplesmente não exibe a informação —
 * é melhor não mostrar nada do que mostrar um CNPJ ou telefone inventado.
 * Preencha aqui ou pelo Painel Admin.
 */
export const INITIAL_SETTINGS: SiteSettings = {
  whatsappNumber: '',
  whatsappWelcomeMessage: 'Olá Gustavo! Vi seu site e gostaria de fazer o diagnóstico gratuito do meu atendimento.',
  contactEmail: '',
  city: '',
  serviceArea: 'Atendimento remoto em todo o Brasil',
  pixKey: '',
  pixKeyType: 'E-mail',
  pixReceiverName: '',
  meiCnpj: '',
  meiStatus: '',
  meiRazaoSocial: '',
  minimumContractMonths: 0,
  heroHeadline: 'Sua tecnologia funcionando — sem você precisar entender de tecnologia',
  heroSubheadline: 'Eu configuro seu WhatsApp, sua agenda online e seus lembretes automáticos em 3 dias úteis. Tudo pronto para usar. Se não funcionar como combinado, eu refaço.'
};

export const INITIAL_LEADS: Lead[] = [];

// v3: preços passaram a ser setupPrice + monthlyPrice, e settings ganhou
// contactEmail/city/CNPJ opcionais. Dados v2 em cache têm outro formato.
const STORAGE_KEYS = {
  PLANS: 'gr_plans_v3',
  ENTRY_OFFER: 'gr_entry_offer_v3',
  POSTS: 'gr_posts_v3',
  SETTINGS: 'gr_settings_v3',
  LEADS: 'gr_leads_v3'
};

export class AppStore {
  // Plans — mesmos dados da seção Preços (#planos) na landing
  static getPlans(): Plan[] {
    const cached = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!cached) return INITIAL_PLANS;

    try {
      const parsed = JSON.parse(cached) as Plan[];
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_PLANS;
      return parsed.map((plan) => ({
        id: plan.id || `plan-${Date.now()}`,
        name: plan.name || 'Plano',
        setupPrice: Number(plan.setupPrice) || 0,
        monthlyPrice: Number(plan.monthlyPrice) || 0,
        description: plan.description || '',
        isPopular: Boolean(plan.isPopular),
        features: Array.isArray(plan.features) ? plan.features : [],
        monthlyCovers: Array.isArray(plan.monthlyCovers) ? plan.monthlyCovers : [],
        ctaText: plan.ctaText || 'Quero este plano',
        whatsappMessage: plan.whatsappMessage || '',
      }));
    } catch {
      return INITIAL_PLANS;
    }
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

  // Entry offer (bloco verde no topo da seção Preços)
  static getEntryOffer(): EntryOffer {
    const cached = localStorage.getItem(STORAGE_KEYS.ENTRY_OFFER);
    if (!cached) return INITIAL_ENTRY_OFFER;

    try {
      const parsed = JSON.parse(cached) as EntryOffer;
      return {
        name: parsed.name || INITIAL_ENTRY_OFFER.name,
        price: Number(parsed.price) || 0,
        deliveryTime: parsed.deliveryTime || INITIAL_ENTRY_OFFER.deliveryTime,
        description: parsed.description || '',
        includes: Array.isArray(parsed.includes) ? parsed.includes : INITIAL_ENTRY_OFFER.includes,
        whatsappMessage: parsed.whatsappMessage || '',
      };
    } catch {
      return INITIAL_ENTRY_OFFER;
    }
  }

  static saveEntryOffer(offer: EntryOffer): void {
    localStorage.setItem(STORAGE_KEYS.ENTRY_OFFER, JSON.stringify(offer));
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
