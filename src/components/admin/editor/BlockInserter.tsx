import React, { useState } from 'react';
import {
  AlignLeft,
  Code2,
  HelpCircle,
  Heading2,
  Image as ImageIcon,
  List,
  Minus,
  MessageCircle,
  Plus,
  Quote,
  Table2,
  Info,
  Video,
} from 'lucide-react';
import type { BlockType } from '../../../types.blocks';
import { BLOCK_LABELS } from '../../../lib/blocks';

const PALETTE: { type: BlockType; icon: React.ElementType; hint: string }[] = [
  { type: 'paragraph', icon: AlignLeft, hint: 'Texto comum do artigo' },
  { type: 'heading', icon: Heading2, hint: 'Divide o artigo em seções' },
  { type: 'list', icon: List, hint: 'Passo a passo ou itens' },
  { type: 'video', icon: Video, hint: 'YouTube, Vimeo ou arquivo' },
  { type: 'image', icon: ImageIcon, hint: 'Foto ou print de tela' },
  { type: 'callout', icon: Info, hint: 'Aviso que não pode passar batido' },
  { type: 'quote', icon: Quote, hint: 'Fala de cliente ou trecho citado' },
  { type: 'faq', icon: HelpCircle, hint: 'Perguntas frequentes (aparece na busca)' },
  { type: 'table', icon: Table2, hint: 'Comparação lado a lado' },
  { type: 'cta', icon: MessageCircle, hint: 'Botão de WhatsApp no meio do texto' },
  { type: 'code', icon: Code2, hint: 'Trecho de código ou configuração' },
  { type: 'divider', icon: Minus, hint: 'Linha separando assuntos' },
];

interface BlockInserterProps {
  onInsert: (type: BlockType) => void;
  /** Botão discreto entre blocos; `always` mostra o rótulo completo. */
  variant?: 'inline' | 'always';
}

export const BlockInserter: React.FC<BlockInserterProps> = ({ onInsert, variant = 'inline' }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={variant === 'inline' ? 'group relative -my-1 h-6' : 'relative'}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={
          variant === 'inline'
            ? 'absolute left-1/2 top-1/2 flex h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/10 bg-surface-container px-3 text-[11px] font-bold text-on-surface-variant opacity-0 transition-opacity hover:border-primary hover:text-primary focus-visible:opacity-100 group-hover:opacity-100'
            : 'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary'
        }
      >
        <Plus className="h-3.5 w-3.5" />
        <span>{variant === 'inline' ? 'Inserir bloco' : 'Adicionar bloco'}</span>
      </button>

      {open && (
        <>
          {/* Clique fora fecha o painel sem precisar acertar o botão de novo. */}
          <button
            type="button"
            aria-label="Fechar lista de blocos"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            className={`absolute z-40 grid w-[min(560px,80vw)] grid-cols-2 gap-1 rounded-xl border border-white/15 bg-surface-container p-2 shadow-2xl sm:grid-cols-3 ${
              variant === 'inline' ? 'left-1/2 top-8 -translate-x-1/2' : 'left-0 top-12'
            }`}
          >
            {PALETTE.map(({ type, icon: Icon, hint }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onInsert(type);
                  setOpen(false);
                }}
                className="flex items-start gap-2 rounded-lg p-2.5 text-left transition-colors hover:bg-primary/15"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold text-on-surface">
                    {BLOCK_LABELS[type]}
                  </span>
                  <span className="block text-[11px] leading-snug text-on-surface-variant">
                    {hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
