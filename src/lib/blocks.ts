import type {
  Block,
  BlockType,
  VideoBlock,
  VideoProvider,
} from '../types.blocks';

/**
 * Utilitários do modelo de blocos.
 *
 * Este arquivo é puro TypeScript, sem React e sem acesso ao DOM: o script de
 * build (sitemap + páginas estáticas) importa daqui para gerar o HTML dos
 * artigos no Node. Não adicione dependência de navegador aqui.
 */

let counter = 0;

export function newBlockId(): string {
  counter += 1;
  return `b${Date.now().toString(36)}${counter.toString(36)}`;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Parágrafo',
  heading: 'Título de seção',
  list: 'Lista',
  quote: 'Citação',
  code: 'Código',
  image: 'Imagem',
  video: 'Vídeo',
  callout: 'Aviso em destaque',
  divider: 'Divisória',
  cta: 'Chamada para WhatsApp',
  table: 'Tabela',
  faq: 'Perguntas frequentes',
};

/** Bloco novo já preenchido com um padrão utilizável. */
export function createBlock(type: BlockType): Block {
  const id = newBlockId();
  switch (type) {
    case 'paragraph':
      return { id, type, text: '' };
    case 'heading':
      return { id, type, level: 2, text: '' };
    case 'list':
      return { id, type, ordered: false, items: [''] };
    case 'quote':
      return { id, type, text: '', citation: '' };
    case 'code':
      return { id, type, code: '', language: '' };
    case 'image':
      return { id, type, src: '', alt: '', caption: '', width: 'normal' };
    case 'video':
      return { id, type, provider: 'youtube', url: '', title: '', caption: '' };
    case 'callout':
      return { id, type, tone: 'info', title: '', text: '' };
    case 'divider':
      return { id, type };
    case 'cta':
      return {
        id,
        type,
        title: 'Quer isso funcionando no seu negócio?',
        text: 'Eu configuro tudo no seu nome e entrego pronto em 7 dias.',
        buttonText: 'Falar com o Gustavo no WhatsApp',
        whatsappMessage: '',
      };
    case 'table':
      return { id, type, header: ['', ''], rows: [['', '']] };
    case 'faq':
      return { id, type, items: [{ question: '', answer: '' }] };
  }
}

/** Título curto para a lista de blocos e para o menu de navegação. */
export function blockSummary(block: Block): string {
  switch (block.type) {
    case 'paragraph':
    case 'quote':
    case 'callout':
    case 'heading':
      return block.text.slice(0, 60);
    case 'list':
      return block.items.filter(Boolean).slice(0, 2).join(' · ').slice(0, 60);
    case 'code':
      return block.code.slice(0, 60);
    case 'image':
      return block.alt || block.src;
    case 'video':
      return block.title || block.url;
    case 'cta':
      return block.title;
    case 'table':
      return block.header.filter(Boolean).join(' | ');
    case 'faq':
      return block.items[0]?.question || '';
    case 'divider':
      return '—';
  }
}

/** Um bloco sem nenhum conteúdo não deve ir para o HTML publicado. */
export function isEmptyBlock(block: Block): boolean {
  switch (block.type) {
    case 'paragraph':
    case 'quote':
    case 'callout':
    case 'heading':
      return block.text.trim() === '';
    case 'list':
      return block.items.every((item) => item.trim() === '');
    case 'code':
      return block.code.trim() === '';
    case 'image':
      return block.src.trim() === '';
    case 'video':
      return block.url.trim() === '';
    case 'cta':
      return block.title.trim() === '' && block.buttonText.trim() === '';
    case 'table':
      return block.header.every((c) => c.trim() === '') && block.rows.length === 0;
    case 'faq':
      return block.items.every((i) => i.question.trim() === '');
    case 'divider':
      return false;
  }
}

/** Remove marcações em linha — usado em resumo, contagem e meta description. */
export function stripInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .trim();
}

/** Texto puro do artigo inteiro — base do resumo automático e do tempo de leitura. */
export function blocksToPlainText(blocks: Block[]): string {
  const parts: string[] = [];
  blocks.forEach((block) => {
    switch (block.type) {
      case 'paragraph':
      case 'quote':
      case 'heading':
        parts.push(stripInline(block.text));
        break;
      case 'callout':
        if (block.title) parts.push(stripInline(block.title));
        parts.push(stripInline(block.text));
        break;
      case 'list':
        block.items.forEach((item) => parts.push(stripInline(item)));
        break;
      case 'image':
        if (block.caption) parts.push(stripInline(block.caption));
        break;
      case 'video':
        if (block.title) parts.push(stripInline(block.title));
        break;
      case 'table':
        parts.push(block.header.join(' '));
        block.rows.forEach((row) => parts.push(row.join(' ')));
        break;
      case 'faq':
        block.items.forEach((i) => {
          parts.push(stripInline(i.question));
          parts.push(stripInline(i.answer));
        });
        break;
      default:
        break;
    }
  });
  return parts.filter(Boolean).join('\n\n');
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Tempo de leitura. 200 palavras/minuto é a média de leitura em português
 * no celular; arredondamos e nunca ficamos abaixo de 1 minuto.
 */
export function estimateReadTime(blocks: Block[]): string {
  const words = countWords(blocksToPlainText(blocks));
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

/** Âncora estável para links de índice (#como-configurar-o-whatsapp). */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function headingAnchor(text: string, fallback: string): string {
  return slugify(text) || fallback;
}

/** Índice do artigo (só H2 e H3 — H4 deixaria a lista longa demais no celular). */
export function buildTableOfContents(
  blocks: Block[]
): { id: string; level: 2 | 3; text: string }[] {
  return blocks
    .filter(
      (b): b is Extract<Block, { type: 'heading' }> =>
        b.type === 'heading' && b.level !== 4 && b.text.trim() !== ''
    )
    .map((b) => ({
      id: b.anchor || headingAnchor(b.text, b.id),
      level: b.level as 2 | 3,
      text: stripInline(b.text),
    }));
}

/* ------------------------------------------------------------------ */
/* Vídeo                                                               */
/* ------------------------------------------------------------------ */

/**
 * Reconhece o link colado do YouTube/Vimeo e devolve provedor + ID.
 * Aceita youtu.be, /watch?v=, /embed/, /shorts/ e /live/.
 */
export function parseVideoUrl(
  raw: string
): { provider: VideoProvider; url: string } | null {
  const value = raw.trim();
  if (!value) return null;

  const youtube = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (youtube) return { provider: 'youtube', url: youtube[1] };

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { provider: 'vimeo', url: vimeo[1] };

  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return { provider: 'youtube', url: value };
  if (/^\d{6,}$/.test(value)) return { provider: 'vimeo', url: value };
  if (/^https?:\/\//.test(value)) return { provider: 'file', url: value };

  return null;
}

export function videoEmbedUrl(block: VideoBlock): string {
  if (block.provider === 'youtube') {
    // nocookie: nada de cookie de rastreio antes de o visitante clicar em play.
    return `https://www.youtube-nocookie.com/embed/${block.url}?autoplay=1&rel=0&modestbranding=1`;
  }
  if (block.provider === 'vimeo') {
    return `https://player.vimeo.com/video/${block.url}?autoplay=1&dnt=1`;
  }
  return block.url;
}

export function videoWatchUrl(block: VideoBlock): string {
  if (block.provider === 'youtube') return `https://www.youtube.com/watch?v=${block.url}`;
  if (block.provider === 'vimeo') return `https://vimeo.com/${block.url}`;
  return block.url;
}

export function videoThumbnail(block: VideoBlock): string {
  if (block.thumbnail) return block.thumbnail;
  if (block.provider === 'youtube') {
    return `https://i.ytimg.com/vi/${block.url}/maxresdefault.jpg`;
  }
  return '';
}

/** Duração no formato ISO 8601 exigido pelo VideoObject (PT2M30S). */
export function isoDuration(seconds?: number): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  const value = `PT${m > 0 ? `${m}M` : ''}${s > 0 ? `${s}S` : ''}`;
  return value === 'PT' ? undefined : value;
}
