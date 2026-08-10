import React from 'react';
import { SiteSettings } from '../../types';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

interface LegalPageProps {
  document: 'privacidade' | 'termos';
  settings: SiteSettings;
  onBackToHome: () => void;
}

interface Block {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/**
 * Política de Privacidade e Termos de Serviço.
 *
 * Quem vende confiança no manuseio de dados não pode deixar de ter estes
 * documentos. O texto é intencionalmente simples — o público é leigo.
 *
 * Os dados do responsável (nome, e-mail, CNPJ) saem das configurações do
 * site: enquanto não estiverem preenchidos, o documento avisa em vez de
 * inventar uma identidade.
 */
const identityLine = (settings: SiteSettings): string => {
  const parts = ['Gustavo Ravel'];
  if (settings.meiRazaoSocial) parts.push(settings.meiRazaoSocial);
  if (settings.meiCnpj) parts.push(`CNPJ ${settings.meiCnpj}`);
  if (settings.city) parts.push(settings.city);
  return parts.join(' · ');
};

const contactLine = (settings: SiteSettings): string =>
  settings.contactEmail
    ? `Para qualquer pedido relacionado aos seus dados, escreva para ${settings.contactEmail}. Respondo em até 7 dias.`
    : 'Para qualquer pedido relacionado aos seus dados, use o formulário de contato desta página. Respondo em até 7 dias.';

const privacyBlocks = (settings: SiteSettings): Block[] => [
  {
    heading: '1. Quem é o responsável pelos seus dados',
    paragraphs: [
      `Os dados coletados nesta página são tratados por ${identityLine(settings)}, pessoa responsável pelos serviços descritos no site.`,
      contactLine(settings)
    ]
  },
  {
    heading: '2. Que dados eu coleto',
    paragraphs: ['Eu coleto apenas o que você digita por vontade própria nos formulários:'],
    bullets: [
      'Nome, e-mail e número de WhatsApp, quando você pede contato ou diagnóstico',
      'Área de atuação do seu negócio e a mensagem que você escrever',
      'As respostas que você marcar no diagnóstico gratuito'
    ]
  },
  {
    heading: '3. Para que eu uso',
    paragraphs: [
      'Uso os seus dados exclusivamente para responder o seu contato, preparar o diagnóstico que você pediu e enviar a proposta correspondente.'
    ],
    bullets: [
      'Não vendo, não alugo e não compartilho os seus dados com terceiros para fins de publicidade',
      'Não te inscrevo em lista de e-mails sem você pedir',
      'Não uso os seus dados para tomar decisão automatizada sobre você'
    ]
  },
  {
    heading: '4. Onde os dados ficam',
    paragraphs: [
      'Os dados enviados pelos formulários ficam armazenados no serviço que recebe o formulário e na minha própria caixa de mensagens, com acesso apenas meu.',
      'Se você já é cliente, os dados necessários para o serviço (como seus horários de atendimento e a descrição dos seus serviços) ficam nas ferramentas criadas no seu próprio nome — ou seja, sob o seu controle.'
    ]
  },
  {
    heading: '5. Por quanto tempo eu guardo',
    paragraphs: [
      'Contatos que não viraram serviço são apagados no prazo de 12 meses. Dados de clientes são guardados enquanto durar a prestação do serviço e pelo prazo legal exigido para documentos fiscais.'
    ]
  },
  {
    heading: '6. Os seus direitos (LGPD)',
    paragraphs: [
      'A Lei Geral de Proteção de Dados (Lei 13.709/2018) te garante direitos que eu cumpro sem burocracia e sem cobrar nada:'
    ],
    bullets: [
      'Saber quais dados seus eu tenho',
      'Corrigir qualquer dado errado ou incompleto',
      'Pedir a exclusão dos seus dados',
      'Retirar o consentimento que você deu, a qualquer momento',
      'Receber uma cópia dos dados que você me enviou'
    ]
  },
  {
    heading: '7. Cookies',
    paragraphs: [
      'Esta página não usa cookies de publicidade nem rastreamento de terceiros para te seguir por outros sites. Se em algum momento eu passar a medir acessos, será com ferramenta que não identifica você individualmente, e este texto será atualizado antes.'
    ]
  },
  {
    heading: '8. Segurança e mudanças',
    paragraphs: [
      'Eu nunca peço a sua senha pessoal do WhatsApp, do banco ou do e-mail. Toda autorização de acesso é feita na tela do seu próprio aparelho, por você.',
      'Se esta política mudar, a data de atualização abaixo muda junto.'
    ]
  }
];

const termsBlocks = (settings: SiteSettings): Block[] => [
  {
    heading: '1. Quem presta o serviço',
    paragraphs: [
      `Os serviços descritos nesta página são prestados por ${identityLine(settings)}.`,
      'Você fala diretamente comigo. Não há equipe de suporte terceirizada intermediando o atendimento.'
    ]
  },
  {
    heading: '2. O que está incluído',
    paragraphs: [
      'O escopo exato — o que vai ser montado, o que o sistema tem que fazer e o prazo — é escrito na proposta que você recebe antes de pagar qualquer valor. A proposta aprovada é o que vale; esta página é apenas apresentação.'
    ]
  },
  {
    heading: '3. Prazo de entrega',
    paragraphs: [
      'O prazo padrão de implantação é de 7 dias, contados a partir do momento em que você me enviar as informações necessárias (serviços, preços, horários e autorizações de acesso).',
      'Se a demora for minha, o prazo não gera custo para você. Se as informações atrasarem, o prazo começa a contar quando elas chegarem.'
    ]
  },
  {
    heading: '4. Pagamento',
    paragraphs: [
      'O serviço é cobrado uma única vez, pelo valor da configuração contratada. Não há mensalidade, assinatura, renovação automática nem qualquer cobrança recorrente.',
      'O pagamento é feito em duas partes: metade na aprovação da proposta e metade após a entrega testada e aprovada por você.'
    ]
  },
  {
    heading: '5. Garantia de entrega',
    paragraphs: [
      'Compromisso principal: WhatsApp Business e agenda online funcionando em até 7 dias corridos, contados conforme o item 3. Se esse prazo não for cumprido, a etapa correspondente não é cobrada.',
      'Se a entrega não fizer o que está escrito na proposta, eu corrijo sem custo adicional. Persistindo a falha, o valor pago por aquela etapa é devolvido.',
      'A garantia cobre o funcionamento do que eu montei. Não cobre mudança de regra ou de preço de ferramentas de terceiros, nem alteração feita por você ou por outra pessoa nas configurações depois da entrega.'
    ]
  },
  {
    heading: '6. Suporte incluído',
    paragraphs: [
      'Os planos que preveem suporte incluem atendimento por WhatsApp, diretamente comigo, pelo período indicado na proposta (30 dias no plano Completo e 90 dias no plano Equipe), para dúvidas e ajustes do que foi entregue.',
      'Encerrado esse período, o sistema continua funcionando normalmente. Novos serviços podem ser contratados à parte, sempre com valor combinado antes.'
    ]
  },
  {
    heading: '7. Propriedade dos acessos',
    paragraphs: [
      'Todas as contas e ferramentas são criadas no seu nome e no seu e-mail. Você é o titular. Eu recebo apenas o acesso necessário para trabalhar, e você pode revogar esse acesso quando quiser.',
      'Concluída a entrega, tudo o que foi configurado continua sendo seu e funcionando, sem qualquer dependência de mim e sem nenhum pagamento adicional.'
    ]
  },
  {
    heading: '8. Desistência',
    paragraphs: [
      'Como não há assinatura, não existe cancelamento a fazer nem multa a pagar.',
      'Se você desistir antes do início da execução, o valor pago é devolvido integralmente. Se desistir com o trabalho em andamento, é cobrado apenas o que já foi efetivamente entregue e aprovado, e o restante é devolvido.'
    ]
  },
  {
    heading: '9. Limites de responsabilidade',
    paragraphs: [
      'Eu não respondo por indisponibilidade, mudança de regra ou bloqueio causados pelas plataformas de terceiros usadas na solução (por exemplo WhatsApp, Google ou provedores de agenda), nem por resultado comercial — quantidade de clientes ou faturamento —, que depende de muitos fatores fora do meu controle.'
    ]
  },
  {
    heading: '10. Foro e legislação',
    paragraphs: [
      'Estes termos seguem a legislação brasileira, incluindo o Código de Defesa do Consumidor e a LGPD. Eventuais conflitos serão resolvidos preferencialmente por conversa direta.'
    ]
  }
];

export const LegalPage: React.FC<LegalPageProps> = ({ document: doc, settings, onBackToHome }) => {
  const isPrivacy = doc === 'privacidade';
  const blocks = isPrivacy ? privacyBlocks(settings) : termsBlocks(settings);
  const title = isPrivacy ? 'Política de Privacidade' : 'Termos de Serviço';
  const Icon = isPrivacy ? ShieldCheck : FileText;

  return (
    <div className="pt-28 pb-24 px-gutter max-w-3xl mx-auto min-h-screen space-y-8">
      <button
        onClick={onBackToHome}
        className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar ao site</span>
      </button>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
          <Icon className="w-4 h-4" />
          <span>Documento oficial</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface">{title}</h1>
        <p className="text-base text-on-surface-variant">
          Escrito em português claro, de propósito. Se alguma parte não ficar clara, me pergunte antes de assinar qualquer coisa.
        </p>
      </div>

      {!settings.contactEmail && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-base">
          Este documento fica completo quando o e-mail de contato for preenchido nas configurações do site.
        </div>
      )}

      <div className="space-y-8">
        {blocks.map((block, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-xl font-bold text-on-surface">{block.heading}</h2>
            {block.paragraphs.map((paragraph, pIdx) => (
              <p key={pIdx} className="text-base text-on-surface-variant leading-relaxed">
                {paragraph}
              </p>
            ))}
            {block.bullets && (
              <ul className="space-y-2 pl-1">
                {block.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-base text-on-surface-variant leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="text-sm text-on-surface-variant pt-6 border-t border-outline-variant">
        Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
      </p>
    </div>
  );
};
