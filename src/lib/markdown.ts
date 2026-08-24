import type { Block } from '../types.blocks';
import { newBlockId, parseVideoUrl, stripInline } from './blocks';

/**
 * Markdown <-> blocos.
 *
 * Escrito à mão de propósito: o site não tem nenhuma dependência de runtime
 * além de React/Supabase, e um parser genérico (marked, remark) traria
 * ~40 kB para o visitante só por causa do painel admin. O que suportamos é o
 * que de fato se usa num artigo: títulos, listas, citação, código, imagem,
 * tabela, divisória, link de vídeo e frontmatter.
 *
 * Sem dependência de DOM — o script de build importa daqui.
 */

/* ------------------------------------------------------------------ */
/* Frontmatter                                                         */
/* ------------------------------------------------------------------ */

export interface Frontmatter {
  [key: string]: string | string[];
}

/**
 * Lê o bloco `---` do topo de um .md exportado de outra ferramenta.
 * Suporta `chave: valor` e listas em `[a, b]` ou `- item`.
 */
export function parseFrontmatter(markdown: string): {
  data: Frontmatter;
  body: string;
} {
  const match = markdown.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: markdown };

  const data: Frontmatter = {};
  let currentListKey: string | null = null;

  match[1].split(/\r?\n/).forEach((line) => {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      const existing = data[currentListKey];
      const value = unquote(listItem[1]);
      data[currentListKey] = Array.isArray(existing) ? [...existing, value] : [value];
      return;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!pair) return;

    const [, key, rawValue] = pair;
    const value = rawValue.trim();

    if (value === '') {
      currentListKey = key;
      data[key] = [];
      return;
    }

    currentListKey = null;

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => unquote(v.trim()))
        .filter(Boolean);
      return;
    }

    data[key] = unquote(value);
  });

  return { data, body: markdown.slice(match[0].length) };
}

function unquote(value: string): string {
  return value.replace(/^['"]|['"]$/g, '').trim();
}

export function frontmatterString(data: Frontmatter, key: string): string {
  const value = data[key];
  if (Array.isArray(value)) return value.join(', ');
  return value || '';
}

export function frontmatterList(data: Frontmatter, key: string): string[] {
  const value = data[key];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Markdown -> blocos                                                  */
/* ------------------------------------------------------------------ */

export interface MarkdownParseResult {
  blocks: Block[];
  /** H1 encontrado no topo — vira sugestão de título do artigo. */
  title?: string;
  frontmatter: Frontmatter;
}

/**
 * Converte um texto em Markdown na lista de blocos do editor.
 *
 * É esta função que sustenta "colar o artigo pronto em .md": ela roda tanto
 * no botão de importar quanto no `onPaste` de um bloco vazio.
 */
export function markdownToBlocks(markdown: string): MarkdownParseResult {
  const { data, body } = parseFrontmatter(markdown);
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let title: string | undefined;
  let i = 0;

  const push = (block: Block) => blocks.push(block);

  while (i < lines.length) {
    const line = lines[i];

    // Linha em branco
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Bloco de código cercado por ```
    const fence = line.match(/^\s*```\s*([A-Za-z0-9+#-]*)\s*$/);
    if (fence) {
      const language = fence[1] || '';
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // fecha a cerca
      push({ id: newBlockId(), type: 'code', code: code.join('\n'), language });
      continue;
    }

    // Divisória
    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      push({ id: newBlockId(), type: 'divider' });
      i += 1;
      continue;
    }

    // Título
    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].replace(/\s*#+\s*$/, '').trim();
      // O H1 é o título do artigo, não um bloco do corpo.
      if (level === 1 && !title) {
        title = stripInline(text);
        i += 1;
        continue;
      }
      push({
        id: newBlockId(),
        type: 'heading',
        level: (Math.min(Math.max(level, 2), 4) as 2 | 3 | 4),
        text,
      });
      i += 1;
      continue;
    }

    // Citação (agrupa linhas seguidas)
    if (/^\s*>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      const joined = quoted.join('\n').trim();
      // "— Fulano" na última linha vira a atribuição da citação.
      const citationMatch = joined.match(/\n\s*[—-]{1,2}\s*(.+)$/);
      push({
        id: newBlockId(),
        type: 'quote',
        text: citationMatch ? joined.slice(0, citationMatch.index).trim() : joined,
        citation: citationMatch ? citationMatch[1].trim() : '',
      });
      continue;
    }

    // Tabela no formato GFM
    if (line.includes('|') && /^\s*\|?[-:\s|]+\|[-:\s|]*$/.test(lines[i + 1] || '')) {
      const header = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      push({ id: newBlockId(), type: 'table', header, rows });
      continue;
    }

    // Listas (numeradas ou com marcador)
    const listItem = line.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/);
    if (listItem) {
      const ordered = Boolean(listItem[2]);
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i].match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/);
        if (!current) break;
        if (Boolean(current[2]) !== ordered) break;
        items.push(current[3].trim());
        i += 1;
        // Continuação indentada da mesma bullet
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*(?:[-*+]|\d+[.)])\s/.test(lines[i])) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i += 1;
        }
      }
      push({ id: newBlockId(), type: 'list', ordered, items });
      continue;
    }

    // Imagem sozinha na linha
    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      push({
        id: newBlockId(),
        type: 'image',
        src: image[2],
        alt: image[1] || '',
        caption: image[3] || '',
        width: 'normal',
      });
      i += 1;
      continue;
    }

    // iframe colado direto do "compartilhar > incorporar" do YouTube/Vimeo
    const iframe = line.trim().match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (iframe) {
      const parsedIframe = parseVideoUrl(iframe[1]);
      if (parsedIframe) {
        push({
          id: newBlockId(),
          type: 'video',
          provider: parsedIframe.provider,
          url: parsedIframe.url,
          title: '',
          caption: '',
        });
        i += 1;
        continue;
      }
    }

    // Link de vídeo sozinho na linha (o caso comum: colar a URL do YouTube)
    const bare = line.trim();
    if (/^(?:https?:\/\/)\S+$/.test(bare) && !/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(bare)) {
      const video = parseVideoUrl(bare);
      if (video && video.provider !== 'file') {
        push({
          id: newBlockId(),
          type: 'video',
          provider: video.provider,
          url: video.url,
          title: '',
          caption: '',
        });
        i += 1;
        continue;
      }
      if (/\.(mp4|webm|mov)$/i.test(bare)) {
        push({
          id: newBlockId(),
          type: 'video',
          provider: 'file',
          url: bare,
          title: '',
          caption: '',
        });
        i += 1;
        continue;
      }
    }

    // Parágrafo: junta linhas até a próxima linha em branco ou início de outro bloco
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !startsNewBlock(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    if (paragraph.length > 0) {
      push({ id: newBlockId(), type: 'paragraph', text: paragraph.join(' ') });
    } else {
      // Segurança contra laço infinito caso nenhuma regra tenha consumido a linha
      i += 1;
    }
  }

  return { blocks, title, frontmatter: data };
}

function startsNewBlock(line: string): boolean {
  return (
    /^\s*#{1,6}\s+/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*(?:[-*+]|\d+[.)])\s+/.test(line) ||
    /^\s*```/.test(line) ||
    /^\s*(?:---|\*\*\*|___)\s*$/.test(line) ||
    /^!\[[^\]]*\]\(/.test(line.trim())
  );
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** Heurística usada no `onPaste`: vale a pena converter isto em blocos? */
export function looksLikeMarkdown(text: string): boolean {
  if (!text.includes('\n')) return false;
  return /(^|\n)\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.*\|)/.test(text);
}

/* ------------------------------------------------------------------ */
/* Blocos -> Markdown                                                  */
/* ------------------------------------------------------------------ */

/** Exporta o artigo de volta para .md — backup e reaproveitamento em outro canal. */
export function blocksToMarkdown(blocks: Block[]): string {
  const parts = blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
        return block.text;
      case 'heading':
        return `${'#'.repeat(block.level)} ${block.text}`;
      case 'list':
        return block.items
          .filter((item) => item.trim() !== '')
          .map((item, index) => (block.ordered ? `${index + 1}. ${item}` : `- ${item}`))
          .join('\n');
      case 'quote': {
        const body = block.text
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n');
        return block.citation ? `${body}\n> — ${block.citation}` : body;
      }
      case 'code':
        return `\`\`\`${block.language || ''}\n${block.code}\n\`\`\``;
      case 'image':
        return `![${block.alt}](${block.src}${block.caption ? ` "${block.caption}"` : ''})`;
      case 'video':
        return videoMarkdown(block);
      case 'callout':
        return `> **${block.title || 'Atenção'}**\n> ${block.text.replace(/\n/g, '\n> ')}`;
      case 'divider':
        return '---';
      case 'cta':
        return `> **${block.title}**\n> ${block.text || ''}\n> [${block.buttonText}](#contato)`;
      case 'table': {
        const header = `| ${block.header.join(' | ')} |`;
        const sep = `| ${block.header.map(() => '---').join(' | ')} |`;
        const rows = block.rows.map((row) => `| ${row.join(' | ')} |`);
        return [header, sep, ...rows].join('\n');
      }
      case 'faq':
        return block.items
          .filter((i) => i.question.trim() !== '')
          .map((i) => `### ${i.question}\n\n${i.answer}`)
          .join('\n\n');
    }
  });

  return parts.filter((part) => part && part.trim() !== '').join('\n\n');
}

function videoMarkdown(block: Extract<Block, { type: 'video' }>): string {
  if (block.provider === 'youtube') return `https://www.youtube.com/watch?v=${block.url}`;
  if (block.provider === 'vimeo') return `https://vimeo.com/${block.url}`;
  return block.url;
}

/* ------------------------------------------------------------------ */
/* Markdown em linha -> HTML                                           */
/* ------------------------------------------------------------------ */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converte a formatação em linha para HTML.
 *
 * Escapa ANTES de aplicar as marcações: o texto vem do painel admin, mas
 * mesmo aí não se injeta HTML cru na página — se um dia o conteúdo passar a
 * vir de outra fonte, o buraco já estaria aberto.
 */
export function inlineToHtml(text: string): string {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_full, label: string, href: string) => {
    const safeHref = sanitizeHref(href);
    if (!safeHref) return label;
    const external = /^https?:\/\//.test(safeHref);
    const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${safeHref}"${rel}>${label}</a>`;
  });

  return html;
}

/** Bloqueia javascript:/data: em links vindos do conteúdo. */
export function sanitizeHref(href: string): string {
  const value = href.trim();
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(value)) return escapeHtml(value);
  return '';
}

/** Bloqueia origens estranhas em `src` de imagem. */
export function sanitizeSrc(src: string): string {
  const value = src.trim();
  if (/^(https?:\/\/|\/)/i.test(value)) return value;
  return '';
}
