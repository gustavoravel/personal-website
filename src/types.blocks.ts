/**
 * Modelo de blocos do editor (estilo Gutenberg).
 *
 * Cada artigo é uma lista ordenada de blocos. Isso substitui a string única
 * de Markdown por uma estrutura que o editor manipula visualmente e que o
 * renderizador público transforma em HTML semântico — que é o que os
 * mecanismos de busca leem.
 *
 * Formatação em linha (negrito, itálico, link, código) continua sendo
 * Markdown DENTRO do texto do bloco. Motivo: mantém a colagem de .md
 * trivial nos dois sentidos (importar e exportar) e evita um editor
 * contentEditable, que é a parte mais frágil de um editor de blocos.
 */

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'quote'
  | 'code'
  | 'image'
  | 'video'
  | 'callout'
  | 'divider'
  | 'cta'
  | 'table'
  | 'faq';

export interface ParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
}

export interface HeadingBlock {
  id: string;
  type: 'heading';
  /** H1 é do título do artigo. O corpo começa em H2 — regra de SEO, não estética. */
  level: 2 | 3 | 4;
  text: string;
  /** Âncora usada no índice do artigo. Gerada do texto quando vazia. */
  anchor?: string;
}

export interface ListBlock {
  id: string;
  type: 'list';
  ordered: boolean;
  items: string[];
}

export interface QuoteBlock {
  id: string;
  type: 'quote';
  text: string;
  citation?: string;
}

export interface CodeBlock {
  id: string;
  type: 'code';
  code: string;
  language?: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  /** Texto alternativo. Obrigatório na prática: acessibilidade e Google Imagens. */
  alt: string;
  caption?: string;
  width?: 'normal' | 'wide';
}

export type VideoProvider = 'youtube' | 'vimeo' | 'file';

export interface VideoBlock {
  id: string;
  type: 'video';
  provider: VideoProvider;
  /** ID do vídeo (YouTube/Vimeo) ou URL do arquivo (MP4). */
  url: string;
  /** Vira o nome do vídeo no schema VideoObject e o rótulo do botão de play. */
  title: string;
  description?: string;
  caption?: string;
  /** Miniatura. Vazio no YouTube = usa a miniatura oficial. */
  thumbnail?: string;
  /** ISO 8601 (YYYY-MM-DD). Exigido pelo VideoObject do Google. */
  uploadDate?: string;
  /** Duração em segundos — vira PT#M#S no schema. */
  durationSeconds?: number;
}

export interface CalloutBlock {
  id: string;
  type: 'callout';
  tone: 'info' | 'warning' | 'success';
  title?: string;
  text: string;
}

export interface DividerBlock {
  id: string;
  type: 'divider';
}

export interface CtaBlock {
  id: string;
  type: 'cta';
  title: string;
  text?: string;
  buttonText: string;
  /** Vazio = usa a mensagem padrão do WhatsApp com o título do artigo. */
  whatsappMessage?: string;
}

export interface TableBlock {
  id: string;
  type: 'table';
  header: string[];
  rows: string[][];
}

export interface FaqBlock {
  id: string;
  type: 'faq';
  items: { question: string; answer: string }[];
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | CalloutBlock
  | DividerBlock
  | CtaBlock
  | TableBlock
  | FaqBlock;

/** Metadados de busca por artigo. Tudo opcional: o artigo tem padrão razoável. */
export interface PostSeo {
  /** Título da aba e do resultado de busca. Vazio = usa o título do artigo. */
  metaTitle?: string;
  /** Descrição do resultado de busca. Vazio = usa o resumo. */
  metaDescription?: string;
  /** Termo que o artigo quer ganhar. Usado só para o checklist do editor. */
  focusKeyword?: string;
  /** URL canônica quando o artigo foi publicado antes em outro lugar. */
  canonicalUrl?: string;
  /** Imagem de compartilhamento (1200x630). Vazio = imagem destacada. */
  ogImage?: string;
  /** Tira o artigo do índice sem despublicar. */
  noindex?: boolean;
}
