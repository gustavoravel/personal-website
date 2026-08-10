import { Plan, CaseStudy, DiagnosticQuestion, BlogPost, FAQItem, Lead, SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Tiers e preços conforme o Offer Triangle (01-estrategia/tech-concierge-offer-triangle.html).
 *
 * Decisões que vêm de lá e NÃO devem ser alteradas sem revisar o documento:
 * - Pagamento único por configuração. Não existe mensalidade.
 * - R$ 397 / R$ 897 / R$ 1.497, com o tier do meio como recomendado.
 * - Entrega em 7 dias corridos, com garantia: se não funcionar, a etapa não é cobrada.
 * - Suporte incluso por período (30 dias no Core, 90 dias no Premium).
 *
 * Os nomes exibidos são em português porque o público é leigo — Starter/Core/
 * Premium ficam só como referência interna em `internalTier`.
 */
export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-essencial',
    name: 'Essencial',
    internalTier: 'Starter',
    price: 397,
    description: 'Seu WhatsApp comercial organizado, respondendo as perguntas repetidas por você.',
    isPopular: false,
    features: [
      'Perfil comercial do WhatsApp configurado com seus horários, endereço e descrição',
      'Catálogo com seus serviços e preços dentro do próprio WhatsApp',
      'Mensagem de saudação e de ausência automáticas',
      'Respostas prontas para as perguntas que você mais recebe',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    supportPeriod: '',
    ctaText: 'Quero o Essencial',
    whatsappMessage: 'Olá Gustavo! Quero o plano Essencial (R$ 397) para organizar meu WhatsApp comercial.'
  },
  {
    id: 'plan-completo',
    name: 'Completo',
    internalTier: 'Core',
    price: 897,
    description: 'Seu cliente agenda sozinho por um link e recebe lembrete automático antes do horário.',
    isPopular: true,
    features: [
      'Tudo do plano Essencial',
      'Agenda online configurada: o cliente escolhe o horário livre sozinho, por um link',
      'Uma automação de atendimento pronta (por exemplo, o lembrete automático antes do horário)',
      'Tudo testado com você antes de entrar no ar',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    supportPeriod: '30 dias',
    ctaText: 'Quero o Completo',
    whatsappMessage: 'Olá Gustavo! Vi o plano Completo (R$ 897) e quero meu agendamento automático funcionando.'
  },
  {
    id: 'plan-equipe',
    name: 'Equipe',
    internalTier: 'Premium',
    price: 1497,
    description: 'Para quem tem funcionários: além de tudo montado, eu treino a sua equipe para usar.',
    isPopular: false,
    features: [
      'Tudo do plano Completo',
      'Treinamento da sua equipe para usar o sistema no dia a dia',
      'Material de apoio simples para consultar depois',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    supportPeriod: '90 dias',
    ctaText: 'Quero o Equipe',
    whatsappMessage: 'Olá Gustavo! Tenho equipe e quero o plano Equipe (R$ 1.497), com treinamento incluso.'
  }
];

// Honest demonstration prototypes instead of fake success statistics
export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    title: 'Como Fica o Agendamento Automático na Prática',
    clientCategory: 'Demonstração de Protótipo',
    timeframe: 'Prazo de 7 dias em contrato',
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
    timeframe: 'Prazo de 7 dias em contrato',
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
    answer: 'É exatamente para isso que eu existo. Você não precisa aprender nada complicado nem entender de código. Eu entrego tudo pronto, testado e funcionando, e depois te explico como mexer em linguagem simples — sem termo técnico e quantas vezes precisar.'
  },
  {
    question: 'As contas e ferramentas ficam no meu nome?',
    answer: 'Sim, e essa é a regra principal do meu trabalho: tudo é criado no seu próprio nome e no seu e-mail. Você é o dono de tudo desde o primeiro dia. Se um dia você não quiser mais falar comigo, nada para de funcionar e você não perde nada — não existe nenhuma peça presa comigo.'
  },
  {
    question: 'Você vai pedir minhas senhas pessoais do WhatsApp?',
    answer: 'Nunca. A configuração é feita com autorização na tela do seu próprio celular, por você. Eu não peço senha do seu WhatsApp, do seu banco nem do seu e-mail. Suas conversas e seus contatos continuam privados — eu não tenho acesso a eles.'
  },
  {
    question: 'É pagamento único ou vou ficar preso numa mensalidade?',
    answer: 'É pagamento único. Você paga a configuração uma vez e pronto — não existe mensalidade, não existe fidelidade e não existe cobrança recorrente. Depois da entrega, o sistema é seu e continua funcionando sem você me pagar mais nada.'
  },
  {
    question: 'Depois que você entregar e for embora, se der problema?',
    answer: 'Todo plano a partir do Completo já vem com um período de suporte incluso por WhatsApp — 30 dias no Completo e 90 dias no Equipe — para tirar dúvida ou ajustar o que for preciso, sem custo. E se o problema for algo que eu configurei errado, eu conserto mesmo fora do prazo: o erro é meu, a conta não é sua.'
  },
  {
    question: 'Em quanto tempo fica pronto de verdade?',
    answer: 'Em até 7 dias corridos, contados de quando você me passar as informações que eu preciso (seus serviços, preços e horários). E esse prazo tem consequência: se o seu WhatsApp e a sua agenda não estiverem funcionando em 7 dias, aquela etapa não é cobrada.'
  },
  {
    question: 'Preciso pagar ferramentas caras além do seu serviço?',
    answer: 'Não. Eu monto tudo em cima de ferramentas gratuitas ou de custo muito baixo: o WhatsApp Business é gratuito, o Google Agenda é gratuito e o agendamento online roda no plano gratuito. Se em algum momento o seu caso exigir uma ferramenta paga, eu te falo o valor antes — nunca aparece cobrança que você não aprovou.'
  },
  {
    question: 'E se eu não gostar do resultado?',
    answer: 'O trabalho só é dado por concluído quando você testar e aprovar funcionando na prática. Se não ficar como combinamos, eu refaço. Se ainda assim não funcionar, você não paga por aquela etapa.'
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
  // DDI 55 + DDD 11 + número. Só dígitos: é assim que o wa.me espera.
  whatsappNumber: '5511921600939',
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
  heroHeadline: 'Sua tecnologia funcionando — sem você precisar entender de tecnologia',
  heroSubheadline: 'Eu configuro seu WhatsApp, sua agenda online e seus lembretes automáticos em 7 dias. Tudo pronto para usar. Se não funcionar como combinado, eu refaço.'
};

export const INITIAL_LEADS: Lead[] = [];

// v4: preços passaram a ser pagamento único (Offer Triangle). Planos em
// cache das versões anteriores têm outro formato e quebrariam a vitrine.
const STORAGE_KEYS = {
  PLANS: 'gr_plans_v4',
  POSTS: 'gr_posts_v4',
  SETTINGS: 'gr_settings_v4',
  LEADS: 'gr_leads_v4'
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

  /**
   * Guarda o lead localmente e, se o Supabase estiver configurado, também lá.
   *
   * Devolve `savedRemotely` para o formulário saber se o contato realmente
   * saiu do navegador. Sem isso o site anunciaria "enviado com sucesso" para
   * um lead que ficou preso no celular do visitante — e você nunca saberia.
   */
  static async addLead(
    lead: Omit<Lead, 'id' | 'createdAt' | 'status'>
  ): Promise<{ lead: Lead; savedRemotely: boolean }> {
    const newLead: Lead = {
      ...lead,
      id: 'lead-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString()
    };

    const updated = [newLead, ...this.getLeads()];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));

    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      return { lead: newLead, savedRemotely: false };
    }

    // A tabela no Supabase usa snake_case (convenção do Postgres) e o app
    // usa camelCase — sem esta tradução o insert falha com PGRST204.
    // `id` e `created_at` não têm valor automático na tabela, então quem
    // gera é o app.
    const row = {
      id: newLead.id,
      created_at: newLead.createdAt,
      name: newLead.name,
      email: newLead.email,
      whatsapp: newLead.whatsapp,
      business_type: newLead.businessType,
      source: newLead.source,
      message: newLead.message ?? null,
      status: newLead.status,
      diagnostic_score: newLead.diagnosticScore ?? null,
      diagnostic_details: newLead.diagnosticDetails ?? null
    };

    try {
      const { error } = await client.from('leads').insert(row);
      if (error && import.meta.env.DEV) {
        console.error('[Supabase] insert em "leads" falhou:', error.code, error.message, error.details);
      }
      return { lead: newLead, savedRemotely: !error };
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Supabase] exceção no insert:', err);
      return { lead: newLead, savedRemotely: false };
    }
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
