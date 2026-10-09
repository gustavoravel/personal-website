/**
 * Validação e proteção anti-spam dos formulários.
 *
 * O que está aqui e por quê:
 *
 * - **Validação própria, não só a do navegador.** A mensagem nativa do
 *   Chrome ("Preencha este campo") aparece numa bolha que desaparece e não é
 *   lida por leitor de tela de forma confiável. Quem usa este site tem faixa
 *   etária mais alta e lê no celular: erro precisa ficar na tela, embaixo do
 *   campo, em português claro.
 *
 * - **Armadilha (honeypot) e tempo mínimo.** São as duas defesas que pegam o
 *   robô comum sem punir ninguém: robô preenche todo campo que encontra,
 *   inclusive o escondido, e envia em menos de um segundo. CAPTCHA foi
 *   descartado de propósito — ele cobra do visitante desconfiado justamente
 *   no momento em que ele decide confiar.
 *
 * Limite honesto: isto roda no navegador, então só atrapalha robô burro. Spam
 * dirigido só se barra no servidor — veja a nota em `verificarAntiSpam`.
 */

export interface CamposContato {
  name: string;
  whatsapp: string;
  email: string;
}

export type ErrosContato = Partial<Record<keyof CamposContato | 'consent', string>>;

/** Sobram 10 ou 11 dígitos num telefone brasileiro, com DDD. */
export function digitosTelefone(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Formata enquanto digita: (11) 99999-9999. */
export function formatarTelefone(valor: string): string {
  const d = digitosTelefone(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function validarContato(campos: CamposContato, consentiu: boolean): ErrosContato {
  const erros: ErrosContato = {};

  const nome = campos.name.trim();
  if (nome.length < 2) {
    erros.name = 'Escreva seu nome para eu saber como te chamar.';
  }

  const digitos = digitosTelefone(campos.whatsapp);
  if (digitos.length === 0) {
    erros.whatsapp = 'Preciso do seu WhatsApp para te responder.';
  } else if (digitos.length < 10 || digitos.length > 11) {
    erros.whatsapp = 'O número parece incompleto. Use DDD + número, como (11) 99999-9999.';
  }

  // E-mail é opcional aqui: o canal principal é o WhatsApp. Mas se foi
  // preenchido, precisa estar certo, senão a resposta não chega.
  const email = campos.email.trim();
  if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    erros.email = 'Esse e-mail parece ter um erro de digitação.';
  }

  if (!consentiu) {
    erros.consent = 'Preciso da sua autorização para guardar seus dados e te responder.';
  }

  return erros;
}

export const TEMPO_MINIMO_MS = 3000;

/**
 * Decide se o envio parece ser de robô.
 *
 * `armadilha` é o campo escondido: humano nunca o vê, então qualquer conteúdo
 * ali denuncia preenchimento automático.
 *
 * Importante: isto não substitui proteção no servidor. Se o endereço do
 * webhook (`VITE_LEAD_ENDPOINT`) vazar, um robô pode postar direto nele sem
 * passar por aqui. A defesa real nesse caso é no destino — Formspree e
 * Web3Forms têm filtro próprio, e no n8n dá para exigir um cabeçalho secreto.
 */
export function verificarAntiSpam(armadilha: string, abertoEm: number): boolean {
  if (armadilha.trim() !== '') return false;
  if (Date.now() - abertoEm < TEMPO_MINIMO_MS) return false;
  return true;
}
