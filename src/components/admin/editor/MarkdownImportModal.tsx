import React, { useMemo, useState } from 'react';
import { FileDown, X } from 'lucide-react';
import type { Block } from '../../../types.blocks';
import { BLOCK_LABELS } from '../../../lib/blocks';
import { frontmatterList, frontmatterString, markdownToBlocks } from '../../../lib/markdown';

export interface MarkdownImportResult {
  blocks: Block[];
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
}

interface MarkdownImportModalProps {
  onClose: () => void;
  onImport: (result: MarkdownImportResult, mode: 'replace' | 'append') => void;
}

/**
 * Colagem de um artigo inteiro em Markdown.
 *
 * O caso de uso real: o artigo é escrito fora (ChatGPT, Obsidian, Notion) e
 * chega pronto em .md. Aqui ele vira blocos editáveis — a prévia à direita
 * existe para conferir ANTES de substituir o que já está no editor.
 *
 * Se o arquivo tiver frontmatter (`---` no topo), título, resumo, categoria e
 * tags já vêm preenchidos.
 */
export const MarkdownImportModal: React.FC<MarkdownImportModalProps> = ({ onClose, onImport }) => {
  const [text, setText] = useState('');

  const parsed = useMemo(() => (text.trim() ? markdownToBlocks(text) : null), [text]);

  const result: MarkdownImportResult | null = parsed
    ? {
        blocks: parsed.blocks,
        title: parsed.title || frontmatterString(parsed.frontmatter, 'title') || undefined,
        excerpt:
          frontmatterString(parsed.frontmatter, 'description') ||
          frontmatterString(parsed.frontmatter, 'excerpt') ||
          undefined,
        category: frontmatterString(parsed.frontmatter, 'category') || undefined,
        tags: frontmatterList(parsed.frontmatter, 'tags'),
      }
    : null;

  const readFile = async (file: File) => {
    setText(await file.text());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-surface-container">
        <header className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Colar artigo em Markdown</h3>
            <p className="text-xs text-on-surface-variant">
              Cole o texto ou escolha um arquivo .md. Ele vira blocos editáveis.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5 text-on-surface-variant hover:text-on-surface" />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-primary">
              <FileDown className="h-4 w-4" />
              <span>Escolher arquivo .md</span>
              <input
                type="file"
                accept=".md,.markdown,.txt,text/markdown"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                }}
              />
            </label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={'# Título do artigo\n\nPrimeiro parágrafo...\n\n## Uma seção\n\n- item\n- item\n\nhttps://youtube.com/watch?v=...'}
              className="h-[46vh] w-full rounded-lg border border-white/10 bg-surface-container-lowest p-3 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Prévia: {result ? `${result.blocks.length} blocos` : 'nada colado ainda'}
            </p>
            <div className="h-[46vh] space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-surface-container-lowest p-3">
              {result?.title && (
                <p className="mb-2 text-sm font-bold text-primary">Título: {result.title}</p>
              )}
              {result?.blocks.map((block, index) => (
                <p key={block.id} className="text-[11px] text-on-surface-variant">
                  <span className="mr-2 text-primary">{index + 1}.</span>
                  <span className="font-bold text-on-surface">{BLOCK_LABELS[block.type]}</span>
                  {block.type === 'video' && ' — vídeo reconhecido do link'}
                </p>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-3 border-t border-white/10 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-bold text-on-surface-variant"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!result}
            onClick={() => result && onImport(result, 'append')}
            className="rounded-lg border border-primary px-4 py-2 text-xs font-bold text-primary disabled:opacity-40"
          >
            Adicionar ao fim
          </button>
          <button
            type="button"
            disabled={!result}
            onClick={() => result && onImport(result, 'replace')}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary disabled:opacity-40"
          >
            Substituir conteúdo
          </button>
        </footer>
      </div>
    </div>
  );
};
