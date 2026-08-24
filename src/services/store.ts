import { Plan, CaseStudy, DiagnosticQuestion, BlogPost, EntryOffer, FAQItem, Lead, SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Tiers e preços.
 *
 * Base: Offer Triangle (01-estrategia/tech-concierge-offer-triangle.html) —
 * pagamento único por configuração, R$ 397 / 897 / 1.497, entrega em 7 dias
 * com garantia de "não funcionou, não é cobrado".
 *
 * DIVERGÊNCIA a atualizar no documento: o Essencial passou a incluir a agenda
 * online (que no Offer Triangle era o Core), e o Completo virou o tier de
 * automação de processos comerciais.
 *
 * O Essencial a R$ 397 com escopo de Core é DECISÃO DELIBERADA: é isca de
 * entrada, para o cliente desconfiado comprar um teste pequeno antes de
 * confiar num valor maior. Não "corrigir" esse preço achando que é erro.
 * O que separa o Essencial do Completo é o suporte (10 dias contra 30) e a
 * automação dos processos comerciais.
 *
 * NADA aqui promete lembrete automático por WhatsApp: pelo aplicativo do
 * celular isso não existe, e pela Cloud API cada mensagem de template tem
 * custo. O que reduz falta aqui é o convite que entra na agenda do próprio
 * cliente — esse sim é gratuito e real.
 */
export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-essencial',
    name: 'Essencial',
    internalTier: 'Starter + Core do Offer Triangle',
    price: 397,
    description: 'Seu WhatsApp comercial organizado e sua agenda online no ar: o cliente marca sozinho, sem você responder nada.',
    isPopular: false,
    features: [
      'Perfil comercial do WhatsApp configurado com seus horários, endereço e descrição',
      'Catálogo com seus serviços e preços dentro do próprio WhatsApp',
      'Mensagem de saudação e de ausência automáticas',
      'Respostas prontas para as perguntas que você mais recebe',
      'Agenda online: o cliente escolhe sozinho um horário livre, por um link',
      'O compromisso entra na agenda dele e na sua, com confirmação por e-mail',
      'Tudo criado no seu nome, com os seus acessos'
    ],
    supportPeriod: '10 dias',
    ctaText: 'Quero o Essencial',
    whatsappMessage: 'Olá Gustavo! Quero o plano Essencial (R$ 397): WhatsApp comercial e agenda online.'
  },
  {
    id: 'plan-completo',
    name: 'Completo',
    internalTier: 'Automação de processos comerciais',
    price: 897,
    description: 'Tudo do Essencial e, depois de olhar seu atendimento de perto, eu faço as tarefas repetitivas acontecerem sozinhas.',
    highlight: 'De nada adianta aparecer mais e atrair mais gente se, na hora que o cliente chega, o seu atendimento trava.',
    isPopular: true,
    features: [
      'Tudo do plano Essencial',
      'Uma conversa em que a gente desenha junto o caminho do cliente, do primeiro "oi" até o pagamento',
      'A gente marca nesse caminho onde você perde tempo e onde o cliente desiste',
      'Eu faço essas tarefas repetitivas acontecerem sozinhas — por exemplo: mandar o orçamento, cobrar quem ficou de responder, retomar quem sumiu no meio',
      'O que vai ser automatizado é definido nessa conversa, porque depende do seu negócio',
      'No fim você recebe por escrito o que passou a ser automático e o que continua na sua mão'
    ],
    supportPeriod: '30 dias',
    ctaText: 'Quero o Completo',
    whatsappMessage: 'Olá Gustavo! Vi o plano Completo (R$ 897) e quero automatizar as tarefas repetidas do meu atendimento.'
  },
  {
    id: 'plan-equipe',
    name: 'Equipe',
    internalTier: 'Premium',
    price: 1497,
    description: 'Para quem tem funcionários: além de montar e automatizar tudo, eu treino a sua equipe para usar no dia a dia.',
    isPopular: false,
    features: [
      'Tudo do plano Completo',
      'Treinamento da sua equipe para usar o sistema no dia a dia',
      'Material de apoio simples para a equipe consultar depois',
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
        'Cliente esquece do horário porque não ficou marcado em lugar nenhum',
        'Falta de organização entre mensagens pessoais e de trabalho'
      ]
    },
    after: {
      status: 'Depois: Sistema Rodando 24 Horas por Dia',
      points: [
        'WhatsApp comercial com mensagem automática e catálogo de serviços',
        'Link de agendamento onde o próprio cliente escolhe o horário livre na sua agenda',
        'O compromisso entra na agenda do próprio cliente, que avisa ele sozinho'
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
        'Você precisa reler a conversa toda para lembrar o que o cliente pediu'
      ]
    },
    after: {
      status: 'Depois: Informações Prontas Antes de Você Responder',
      points: [
        'Formulário simples que coleta o que você precisa saber em 1 minuto',
        'As informações chegam organizadas direto no seu WhatsApp',
        'Organização clara do status de cada atendimento'
      ]
    },
    metric: '1 min',
    metricLabel: 'Para o Cliente Preencher',
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
    answer: 'Todo plano já vem com um período de suporte incluso por WhatsApp, direto comigo: 10 dias no Essencial, 30 dias no Completo e 90 dias no Equipe, para tirar dúvida ou ajustar o que for preciso, sem custo. E se o problema for algo que eu configurei errado, eu conserto mesmo fora do prazo: o erro é meu, a conta não é sua.'
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
      { text: 'Mando os horários por texto e anoto num bloco de notas ou papel', score: 20, recommendation: 'Agenda online sincronizada, com o compromisso entrando direto na agenda do cliente.' },
      { text: 'O cliente já escolhe o horário sozinho por um link online', score: 30, recommendation: 'Automatizar o que vem depois do agendamento: confirmação, orçamento e retomada de quem some.' }
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
      { text: 'Mais de 2 horas por dia enviando orçamentos, arquivos e cobranças na mão', score: 10, recommendation: 'Automação das tarefas repetitivas do seu atendimento, definidas numa conversa de diagnóstico.' },
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
  heroSubheadline: 'Eu organizo seu WhatsApp comercial e coloco sua agenda online no ar em 7 dias. Tudo pronto para usar. Se não funcionar como combinado, a etapa não é cobrada.'
};

/**
 * Oferta de entrada: o teste pequeno que o comprador desconfiado aceita antes
 * de fechar um plano. Preço e escopo ficam editáveis no admin.
 */
export const INITIAL_ENTRY_OFFER: EntryOffer = {
  name: 'Diagnóstico + WhatsApp comercial no ar',
  price: 197,
  deliveryTime: '3 dias',
  description:
    'Um primeiro passo pequeno: eu olho seu atendimento de perto e deixo seu WhatsApp comercial organizado, para você ver como é trabalhar comigo antes de contratar um plano.',
  includes: [
    'Conversa de 30 minutos sobre como o cliente chega até você hoje',
    'Perfil comercial do WhatsApp configurado com horários e descrição',
    'Mensagem de saudação e de ausência automáticas',
    'Lista por escrito do que dá para melhorar em seguida',
  ],
  whatsappMessage:
    'Olá Gustavo! Quero começar pelo diagnóstico com o WhatsApp comercial configurado.',
};

export const INITIAL_LEADS: Lead[] = [];

// v4: preços passaram a ser pagamento único (Offer Triangle). Planos em
// cache das versões anteriores têm outro formato e quebrariam a vitrine.
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
      // O mapeamento abaixo tinha ficado no formato antigo (montagem +
      // mensalidade) depois que os planos viraram pagamento único: ele
      // devolvia planos sem preço, e a vitrine mostrava R$ 0.
      return parsed.map((plan) => ({
        id: plan.id || `plan-${Date.now()}`,
        name: plan.name || 'Plano',
        internalTier: plan.internalTier || '',
        price: Number(plan.price) || 0,
        description: plan.description || '',
        highlight: plan.highlight,
        isPopular: Boolean(plan.isPopular),
        features: Array.isArray(plan.features) ? plan.features : [],
        supportPeriod: plan.supportPeriod || '',
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
  //
  // O navegador é a fonte imediata (localStorage) e o Supabase é a cópia
  // compartilhada entre dispositivos. A tabela usa snake_case (convenção do
  // Postgres) e o app usa camelCase, então cada lado tem seu mapeamento —
  // sem isso o upsert falha silenciosamente e o artigo só existe no
  // computador em que foi escrito.
  static getPosts(): BlogPost[] {
    const cached = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!cached) return [];

    try {
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeStoredPost);
    } catch {
      return [];
    }
  }

  static savePosts(posts: BlogPost[]): void {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    void client
      .from('blog_posts')
      .upsert(posts.map(postToRow))
      .then(({ error }) => {
        if (error) console.error('Não foi possível sincronizar os artigos:', error.message);
      });
  }

  /**
   * Busca os artigos no Supabase e funde com o que existe neste navegador.
   *
   * Fusão, e não substituição: um rascunho escrito aqui que ainda não subiu
   * (tabela sem as colunas novas, sem internet, RLS recusando) sumiria da
   * tela e do cache se a resposta remota simplesmente sobrescrevesse tudo.
   * Em caso de conflito no mesmo id, vence a versão editada por último.
   */
  static async fetchPosts(): Promise<BlogPost[] | null> {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return null;

    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data) return null;

    const local = AppStore.getPosts();
    const merged = new Map<string, BlogPost>();

    local.forEach((post) => merged.set(post.id, post));

    data.map(rowToPost).forEach((remote) => {
      const current = merged.get(remote.id);
      const remoteIsNewer =
        !current || (remote.updatedAt || '') >= (current.updatedAt || '');
      if (remoteIsNewer) merged.set(remote.id, remote);
    });

    const posts = Array.from(merged.values()).sort((a, b) =>
      a.publishedAt < b.publishedAt ? 1 : -1
    );

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts;
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


/* ------------------------------------------------------------------ */
/* Mapeamento dos artigos entre o app e o Postgres                     */
/* ------------------------------------------------------------------ */

type PostRow = Record<string, unknown>;

/** Garante os campos novos (blocos, tags, SEO) em artigos salvos antes. */
function normalizeStoredPost(post: BlogPost): BlogPost {
  return {
    ...post,
    blocks: Array.isArray(post.blocks) ? post.blocks : undefined,
    tags: Array.isArray(post.tags) ? post.tags : [],
    seo: post.seo && typeof post.seo === 'object' ? post.seo : {},
    isPublished: Boolean(post.isPublished),
  };
}

function postToRow(post: BlogPost): PostRow {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    blocks: post.blocks ?? null,
    category: post.category,
    tags: post.tags ?? [],
    read_time: post.readTime,
    published_at: post.publishedAt,
    updated_at: post.updatedAt ?? post.publishedAt,
    author: post.author,
    featured_image: post.featuredImage || null,
    featured_image_alt: post.featuredImageAlt || null,
    seo: post.seo ?? {},
    is_published: post.isPublished,
  };
}

function rowToPost(row: PostRow): BlogPost {
  return normalizeStoredPost({
    id: String(row.id),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    excerpt: String(row.excerpt ?? ''),
    content: String(row.content ?? ''),
    blocks: (row.blocks as BlogPost['blocks']) ?? undefined,
    category: String(row.category ?? 'Geral'),
    tags: (row.tags as string[]) ?? [],
    readTime: String(row.read_time ?? '4 min'),
    publishedAt: String(row.published_at ?? ''),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    author: String(row.author ?? 'Gustavo Ravel'),
    featuredImage: (row.featured_image as string) ?? '',
    featuredImageAlt: (row.featured_image_alt as string) ?? '',
    seo: (row.seo as BlogPost['seo']) ?? {},
    isPublished: Boolean(row.is_published),
  });
}
