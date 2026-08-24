import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Copy,
  Italic,
  Link2,
  Trash2,
  Type,
} from 'lucide-react';
import type { Block, BlockType } from '../../../types.blocks';
import { BLOCK_LABELS, createBlock, newBlockId, parseVideoUrl } from '../../../lib/blocks';
import { looksLikeMarkdown, markdownToBlocks } from '../../../lib/markdown';
import { AutoTextarea } from './AutoTextarea';
import { BlockInserter } from './BlockInserter';

/**
 * Editor de blocos.
 *
 * Três formas de escrever, porque o autor alterna entre elas:
 *
 * 1. Digitando — atalhos de Markdown transformam o bloco enquanto se escreve
 *    (`## ` vira título, `- ` vira lista, `> ` vira citação, ``` vira código).
 * 2. Colando Markdown — o texto colado vira vários blocos de uma vez.
 * 3. Pelo menu de blocos — para vídeo, tabela, aviso e chamada de WhatsApp,
 *    que não têm equivalente natural em Markdown.
 *
 * O foco é controlado à mão (`focusRequest`) porque, ao dividir ou apagar um
 * bloco, o cursor precisa cair no bloco certo — sem isso o autor perde o lugar
 * a cada Enter.
 */

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

type FocusRequest = { id: string; caret?: 'start' | 'end' } | null;

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [focusRequest, setFocusRequest] = useState<FocusRequest>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fields = useRef(new Map<string, HTMLTextAreaElement>());

  const registerField = useCallback((id: string, element: HTMLTextAreaElement | null) => {
    if (element) fields.current.set(id, element);
    else fields.current.delete(id);
  }, []);

  useEffect(() => {
    if (!focusRequest) return;
    const element = fields.current.get(focusRequest.id);
    if (!element) return;
    element.focus();
    const position = focusRequest.caret === 'start' ? 0 : element.value.length;
    element.setSelectionRange(position, position);
    setFocusRequest(null);
  }, [focusRequest, blocks]);

  /* ---------------------------------------------------------------- */
  /* Operações sobre a lista                                           */
  /* ---------------------------------------------------------------- */

  const update = (id: string, patch: Partial<Block>) => {
    onChange(blocks.map((block) => (block.id === id ? ({ ...block, ...patch } as Block) : block)));
  };

  const replaceBlock = (id: string, next: Block) => {
    onChange(blocks.map((block) => (block.id === id ? next : block)));
    setFocusRequest({ id: next.id, caret: 'end' });
  };

  const insertAt = (index: number, ...added: Block[]) => {
    const next = [...blocks];
    next.splice(index, 0, ...added);
    onChange(next);
    const last = added[added.length - 1];
    if (last) setFocusRequest({ id: last.id, caret: 'end' });
  };

  const removeAt = (index: number) => {
    if (blocks.length === 1) {
      const fresh = createBlock('paragraph');
      onChange([fresh]);
      setFocusRequest({ id: fresh.id });
      return;
    }
    const next = blocks.filter((_, i) => i !== index);
    onChange(next);
    const previous = next[Math.max(0, index - 1)];
    if (previous) setFocusRequest({ id: previous.id, caret: 'end' });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const duplicate = (index: number) => {
    const copy = { ...blocks[index], id: newBlockId() } as Block;
    insertAt(index + 1, copy);
  };

  /** Troca o tipo do bloco preservando o texto quando faz sentido. */
  const transform = (index: number, type: BlockType) => {
    const current = blocks[index];
    const fresh = createBlock(type);
    const text =
      current.type === 'paragraph' || current.type === 'heading' || current.type === 'quote'
        ? current.text
        : current.type === 'list'
          ? current.items.join('\n')
          : '';

    if (fresh.type === 'paragraph' || fresh.type === 'heading' || fresh.type === 'quote') {
      replaceBlock(current.id, { ...fresh, text: text.replace(/\n/g, ' ') } as Block);
      return;
    }
    if (fresh.type === 'list' && text) {
      replaceBlock(current.id, { ...fresh, items: text.split('\n') });
      return;
    }
    replaceBlock(current.id, fresh);
  };

  /* ---------------------------------------------------------------- */
  /* Digitação: atalhos de Markdown e teclas                           */
  /* ---------------------------------------------------------------- */

  /**
   * Converte o bloco assim que o autor digita a marcação no começo da linha.
   * Devolve `true` quando houve transformação (o texto normal não é aplicado).
   */
  const applyMarkdownShortcut = (block: Block, value: string): boolean => {
    if (block.type !== 'paragraph') return false;

    const heading = value.match(/^(#{2,4})\s(.*)$/);
    if (heading) {
      replaceBlock(block.id, {
        id: block.id,
        type: 'heading',
        level: heading[1].length as 2 | 3 | 4,
        text: heading[2],
      });
      return true;
    }

    const bullet = value.match(/^[-*]\s(.*)$/);
    if (bullet) {
      replaceBlock(block.id, { id: block.id, type: 'list', ordered: false, items: [bullet[1]] });
      return true;
    }

    const ordered = value.match(/^1[.)]\s(.*)$/);
    if (ordered) {
      replaceBlock(block.id, { id: block.id, type: 'list', ordered: true, items: [ordered[1]] });
      return true;
    }

    const quote = value.match(/^>\s(.*)$/);
    if (quote) {
      replaceBlock(block.id, { id: block.id, type: 'quote', text: quote[1], citation: '' });
      return true;
    }

    if (value === '```') {
      replaceBlock(block.id, { id: block.id, type: 'code', code: '', language: '' });
      return true;
    }

    if (value === '---') {
      replaceBlock(block.id, { id: block.id, type: 'divider' });
      return true;
    }

    return false;
  };

  /** Colar Markdown vira vários blocos; colar texto simples segue normal. */
  const handlePaste = (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
    index: number,
    block: Block
  ) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text || !looksLikeMarkdown(text)) return;

    event.preventDefault();
    const { blocks: parsed } = markdownToBlocks(text);
    if (parsed.length === 0) return;

    const isEmptyParagraph = block.type === 'paragraph' && block.text.trim() === '';
    const next = [...blocks];
    next.splice(index, isEmptyParagraph ? 1 : 0, ...parsed);
    onChange(next);
    setFocusRequest({ id: parsed[parsed.length - 1].id, caret: 'end' });
  };

  const handleTextKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number,
    block: Block
  ) => {
    const element = event.currentTarget;

    // Enter cria o próximo bloco; Shift+Enter quebra a linha dentro do bloco.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const caret = element.selectionStart;
      const before = element.value.slice(0, caret);
      const after = element.value.slice(caret);

      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
        update(block.id, { text: before } as Partial<Block>);
      }

      const fresh = createBlock('paragraph');
      insertAt(index + 1, { ...fresh, text: after } as Block);
      return;
    }

    // Backspace no começo de um bloco vazio remove o bloco.
    if (
      event.key === 'Backspace' &&
      element.selectionStart === 0 &&
      element.selectionEnd === 0 &&
      element.value === ''
    ) {
      event.preventDefault();
      removeAt(index);
      return;
    }

    // Título vazio volta a ser parágrafo — evita ficar preso no formato errado.
    if (
      event.key === 'Backspace' &&
      element.value === '' &&
      (block.type === 'heading' || block.type === 'quote')
    ) {
      event.preventDefault();
      replaceBlock(block.id, { ...createBlock('paragraph'), id: block.id } as Block);
    }
  };

  /** Aplica **negrito**, *itálico* e link no trecho selecionado. */
  const wrapSelection = (id: string, prefix: string, suffix: string, placeholder: string) => {
    const element = fields.current.get(id);
    if (!element) return;

    const { selectionStart, selectionEnd, value } = element;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const next = `${value.slice(0, selectionStart)}${prefix}${selected}${suffix}${value.slice(selectionEnd)}`;

    const block = blocks.find((item) => item.id === id);
    if (!block) return;

    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
      update(id, { text: next } as Partial<Block>);
      requestAnimationFrame(() => {
        element.focus();
        element.setSelectionRange(
          selectionStart + prefix.length,
          selectionStart + prefix.length + selected.length
        );
      });
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-1">
      {blocks.map((block, index) => (
        <div key={block.id}>
          <BlockInserter onInsert={(type) => insertAt(index, createBlock(type))} />

          <div
            onFocus={() => setSelectedId(block.id)}
            className={`rounded-xl border p-3 transition-colors ${
              selectedId === block.id
                ? 'border-primary/60 bg-surface-container-low'
                : 'border-transparent hover:border-white/10'
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-1">
              <span className="mr-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                <Type className="h-3 w-3" />
                {BLOCK_LABELS[block.type]}
              </span>

              {(block.type === 'paragraph' ||
                block.type === 'heading' ||
                block.type === 'quote') && (
                <>
                  <ToolbarButton
                    label="Negrito"
                    onClick={() => wrapSelection(block.id, '**', '**', 'texto')}
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Itálico"
                    onClick={() => wrapSelection(block.id, '*', '*', 'texto')}
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Link"
                    onClick={() => wrapSelection(block.id, '[', '](https://)', 'texto do link')}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </ToolbarButton>
                </>
              )}

              <select
                aria-label="Trocar tipo do bloco"
                value={block.type}
                onChange={(event) => transform(index, event.target.value as BlockType)}
                className="rounded border border-white/10 bg-surface-container px-1.5 py-1 text-[11px] text-on-surface-variant"
              >
                {Object.entries(BLOCK_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>

              <ToolbarButton label="Mover para cima" onClick={() => move(index, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Mover para baixo" onClick={() => move(index, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Duplicar" onClick={() => duplicate(index)}>
                <Copy className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Excluir bloco" onClick={() => removeAt(index)} danger>
                <Trash2 className="h-3.5 w-3.5" />
              </ToolbarButton>
            </div>

            <BlockFields
              block={block}
              index={index}
              registerField={registerField}
              update={update}
              replaceBlock={replaceBlock}
              insertAt={insertAt}
              removeAt={removeAt}
              onKeyDown={handleTextKeyDown}
              onPaste={handlePaste}
              applyMarkdownShortcut={applyMarkdownShortcut}
              setFocusRequest={setFocusRequest}
            />
          </div>
        </div>
      ))}

      <div className="pt-3">
        <BlockInserter
          variant="always"
          onInsert={(type) => insertAt(blocks.length, createBlock(type))}
        />
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, danger, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`rounded p-1.5 transition-colors ${
      danger
        ? 'text-rose-400 hover:bg-rose-500/20'
        : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
    }`}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Campos de cada tipo de bloco                                        */
/* ------------------------------------------------------------------ */

interface BlockFieldsProps {
  block: Block;
  index: number;
  registerField: (id: string, element: HTMLTextAreaElement | null) => void;
  update: (id: string, patch: Partial<Block>) => void;
  replaceBlock: (id: string, next: Block) => void;
  insertAt: (index: number, ...blocks: Block[]) => void;
  removeAt: (index: number) => void;
  onKeyDown: (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number,
    block: Block
  ) => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>, index: number, block: Block) => void;
  applyMarkdownShortcut: (block: Block, value: string) => boolean;
  setFocusRequest: (request: FocusRequest) => void;
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none';

const BlockFields: React.FC<BlockFieldsProps> = ({
  block,
  index,
  registerField,
  update,
  replaceBlock,
  insertAt,
  removeAt,
  onKeyDown,
  onPaste,
  applyMarkdownShortcut,
  setFocusRequest,
}) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <AutoTextarea
          innerRef={(element) => registerField(block.id, element)}
          value={block.text}
          placeholder="Escreva aqui. Cole um texto em Markdown para virar vários blocos."
          onChange={(event) => {
            if (applyMarkdownShortcut(block, event.target.value)) return;
            update(block.id, { text: event.target.value } as Partial<Block>);
          }}
          onKeyDown={(event) => onKeyDown(event, index, block)}
          onPaste={(event) => onPaste(event, index, block)}
          className="text-[1.05rem] leading-relaxed text-on-surface placeholder:text-on-surface-variant/60"
        />
      );

    case 'heading':
      return (
        <div className="flex items-start gap-2">
          <select
            aria-label="Nível do título"
            value={block.level}
            onChange={(event) =>
              update(block.id, { level: Number(event.target.value) as 2 | 3 | 4 } as Partial<Block>)
            }
            className="rounded border border-white/10 bg-surface-container px-2 py-1 text-xs text-on-surface-variant"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
          <AutoTextarea
            innerRef={(element) => registerField(block.id, element)}
            value={block.text}
            placeholder="Título da seção"
            onChange={(event) => update(block.id, { text: event.target.value } as Partial<Block>)}
            onKeyDown={(event) => onKeyDown(event, index, block)}
            onPaste={(event) => onPaste(event, index, block)}
            className="text-xl font-extrabold text-on-surface placeholder:text-on-surface-variant/60"
          />
        </div>
      );

    case 'list':
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update(block.id, { ordered: false } as Partial<Block>)}
              className={`rounded px-2 py-1 text-[11px] font-bold ${!block.ordered ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
            >
              Com marcador
            </button>
            <button
              type="button"
              onClick={() => update(block.id, { ordered: true } as Partial<Block>)}
              className={`rounded px-2 py-1 text-[11px] font-bold ${block.ordered ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
            >
              Numerada
            </button>
          </div>

          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-start gap-2">
              <span className="pt-1.5 text-xs text-primary">
                {block.ordered ? `${itemIndex + 1}.` : '•'}
              </span>
              <AutoTextarea
                innerRef={(element) =>
                  registerField(itemIndex === 0 ? block.id : `${block.id}:${itemIndex}`, element)
                }
                value={item}
                placeholder="Item da lista"
                onChange={(event) => {
                  const items = [...block.items];
                  items[itemIndex] = event.target.value;
                  update(block.id, { items } as Partial<Block>);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    // Enter em item vazio encerra a lista e volta ao parágrafo.
                    if (item.trim() === '' && itemIndex === block.items.length - 1) {
                      const items = block.items.slice(0, -1);
                      if (items.length === 0) {
                        replaceBlock(block.id, { ...createBlock('paragraph'), id: block.id });
                        return;
                      }
                      update(block.id, { items } as Partial<Block>);
                      insertAt(index + 1, createBlock('paragraph'));
                      return;
                    }
                    const items = [...block.items];
                    items.splice(itemIndex + 1, 0, '');
                    update(block.id, { items } as Partial<Block>);
                    setFocusRequest({ id: `${block.id}:${itemIndex + 1}` });
                    return;
                  }

                  if (event.key === 'Backspace' && item === '' && block.items.length > 1) {
                    event.preventDefault();
                    const items = block.items.filter((_, i) => i !== itemIndex);
                    update(block.id, { items } as Partial<Block>);
                    setFocusRequest({
                      id: itemIndex - 1 === 0 ? block.id : `${block.id}:${itemIndex - 1}`,
                      caret: 'end',
                    });
                  }
                }}
                onPaste={(event) => onPaste(event, index, block)}
                className="text-[1.02rem] text-on-surface placeholder:text-on-surface-variant/60"
              />
            </div>
          ))}
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-2 border-l-4 border-primary pl-3">
          <AutoTextarea
            innerRef={(element) => registerField(block.id, element)}
            value={block.text}
            placeholder="Trecho citado ou fala de cliente"
            onChange={(event) => update(block.id, { text: event.target.value } as Partial<Block>)}
            onKeyDown={(event) => onKeyDown(event, index, block)}
            onPaste={(event) => onPaste(event, index, block)}
            className="text-lg italic text-on-surface placeholder:text-on-surface-variant/60"
          />
          <input
            type="text"
            value={block.citation || ''}
            placeholder="Quem falou (opcional)"
            onChange={(event) =>
              update(block.id, { citation: event.target.value } as Partial<Block>)
            }
            className={inputClass}
          />
        </div>
      );

    case 'code':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.language || ''}
            placeholder="Linguagem (opcional)"
            onChange={(event) =>
              update(block.id, { language: event.target.value } as Partial<Block>)
            }
            className={`${inputClass} max-w-[200px]`}
          />
          <AutoTextarea
            innerRef={(element) => registerField(block.id, element)}
            value={block.code}
            placeholder="Cole o código aqui"
            onChange={(event) => update(block.id, { code: event.target.value } as Partial<Block>)}
            className="rounded-lg border border-white/10 bg-surface-container-lowest p-3 font-mono text-xs text-on-surface"
          />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-2">
          <input
            type="url"
            value={block.src}
            placeholder="Endereço da imagem (https://...)"
            onChange={(event) => update(block.id, { src: event.target.value } as Partial<Block>)}
            className={inputClass}
          />
          <input
            type="text"
            value={block.alt}
            placeholder="Descreva a imagem (aparece no Google Imagens e para quem usa leitor de tela)"
            onChange={(event) => update(block.id, { alt: event.target.value } as Partial<Block>)}
            className={inputClass}
          />
          {block.src && !block.alt && (
            <p className="text-[11px] text-amber-300">
              Sem essa descrição a imagem não aparece na busca por imagens.
            </p>
          )}
          <input
            type="text"
            value={block.caption || ''}
            placeholder="Legenda abaixo da imagem (opcional)"
            onChange={(event) =>
              update(block.id, { caption: event.target.value } as Partial<Block>)
            }
            className={inputClass}
          />
          {block.src && (
            <img
              src={block.src}
              alt=""
              className="max-h-48 rounded-lg border border-white/10 object-cover"
            />
          )}
        </div>
      );

    case 'video':
      return (
        <div className="space-y-2">
          <input
            type="text"
            defaultValue={
              block.provider === 'youtube' && block.url
                ? `https://www.youtube.com/watch?v=${block.url}`
                : block.url
            }
            placeholder="Cole o link do YouTube, do Vimeo ou do arquivo .mp4"
            onChange={(event) => {
              const parsed = parseVideoUrl(event.target.value);
              if (!parsed) return;
              update(block.id, {
                provider: parsed.provider,
                url: parsed.url,
              } as Partial<Block>);
            }}
            className={inputClass}
          />
          <p className="text-[11px] text-on-surface-variant">
            Reconhecido: {block.provider === 'file' ? 'arquivo de vídeo' : block.provider} —{' '}
            {block.url || 'aguardando o link'}
          </p>

          <input
            type="text"
            value={block.title}
            placeholder="Título do vídeo (é o que a busca mostra junto do vídeo)"
            onChange={(event) => update(block.id, { title: event.target.value } as Partial<Block>)}
            className={inputClass}
          />
          <input
            type="text"
            value={block.caption || ''}
            placeholder="Legenda abaixo do vídeo (opcional)"
            onChange={(event) =>
              update(block.id, { caption: event.target.value } as Partial<Block>)
            }
            className={inputClass}
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-[11px] text-on-surface-variant">
              Publicado em
              <input
                type="date"
                value={block.uploadDate || ''}
                onChange={(event) =>
                  update(block.id, { uploadDate: event.target.value } as Partial<Block>)
                }
                className={inputClass}
              />
            </label>
            <label className="text-[11px] text-on-surface-variant">
              Duração em segundos
              <input
                type="number"
                min={0}
                value={block.durationSeconds ?? ''}
                onChange={(event) =>
                  update(block.id, {
                    durationSeconds: Number(event.target.value) || undefined,
                  } as Partial<Block>)
                }
                className={inputClass}
              />
            </label>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Data e duração são o que o Google exige para listar o vídeo na busca por vídeos.
          </p>
        </div>
      );

    case 'callout':
      return (
        <div className="space-y-2">
          <select
            aria-label="Tom do aviso"
            value={block.tone}
            onChange={(event) =>
              update(block.id, {
                tone: event.target.value as 'info' | 'warning' | 'success',
              } as Partial<Block>)
            }
            className={`${inputClass} max-w-[220px]`}
          >
            <option value="info">Informação</option>
            <option value="warning">Atenção</option>
            <option value="success">Boa prática</option>
          </select>
          <input
            type="text"
            value={block.title || ''}
            placeholder="Título do aviso (opcional)"
            onChange={(event) => update(block.id, { title: event.target.value } as Partial<Block>)}
            className={inputClass}
          />
          <AutoTextarea
            innerRef={(element) => registerField(block.id, element)}
            value={block.text}
            placeholder="Texto do aviso"
            onChange={(event) => update(block.id, { text: event.target.value } as Partial<Block>)}
            className="rounded-lg border border-white/10 bg-surface-container p-3 text-sm text-on-surface"
          />
        </div>
      );

    case 'divider':
      return <hr className="my-2 border-white/20" />;

    case 'cta':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.title}
            placeholder="Título da chamada"
            onChange={(event) => update(block.id, { title: event.target.value } as Partial<Block>)}
            className={inputClass}
          />
          <input
            type="text"
            value={block.text || ''}
            placeholder="Frase de apoio"
            onChange={(event) => update(block.id, { text: event.target.value } as Partial<Block>)}
            className={inputClass}
          />
          <input
            type="text"
            value={block.buttonText}
            placeholder="Texto do botão"
            onChange={(event) =>
              update(block.id, { buttonText: event.target.value } as Partial<Block>)
            }
            className={inputClass}
          />
          <input
            type="text"
            value={block.whatsappMessage || ''}
            placeholder="Mensagem que abre no WhatsApp (vazio = usa o título do artigo)"
            onChange={(event) =>
              update(block.id, { whatsappMessage: event.target.value } as Partial<Block>)
            }
            className={inputClass}
          />
        </div>
      );

    case 'table':
      return (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {block.header.map((cell, cellIndex) => (
                    <th key={cellIndex} className="p-1">
                      <input
                        type="text"
                        value={cell}
                        placeholder={`Coluna ${cellIndex + 1}`}
                        onChange={(event) => {
                          const header = [...block.header];
                          header[cellIndex] = event.target.value;
                          update(block.id, { header } as Partial<Block>);
                        }}
                        className={`${inputClass} font-bold`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {block.header.map((_, cellIndex) => (
                      <td key={cellIndex} className="p-1">
                        <input
                          type="text"
                          value={row[cellIndex] || ''}
                          onChange={(event) => {
                            const rows = block.rows.map((r) => [...r]);
                            rows[rowIndex][cellIndex] = event.target.value;
                            update(block.id, { rows } as Partial<Block>);
                          }}
                          className={inputClass}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() =>
                update(block.id, {
                  header: [...block.header, ''],
                  rows: block.rows.map((row) => [...row, '']),
                } as Partial<Block>)
              }
              className="rounded bg-white/10 px-2 py-1 text-on-surface"
            >
              + coluna
            </button>
            <button
              type="button"
              onClick={() =>
                update(block.id, {
                  rows: [...block.rows, block.header.map(() => '')],
                } as Partial<Block>)
              }
              className="rounded bg-white/10 px-2 py-1 text-on-surface"
            >
              + linha
            </button>
            <button
              type="button"
              onClick={() => update(block.id, { rows: block.rows.slice(0, -1) } as Partial<Block>)}
              className="rounded bg-white/10 px-2 py-1 text-rose-300"
            >
              remover última linha
            </button>
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="space-y-1 rounded-lg border border-white/10 p-2">
              <input
                type="text"
                value={item.question}
                placeholder="Pergunta que o cliente faz"
                onChange={(event) => {
                  const items = block.items.map((i, i2) =>
                    i2 === itemIndex ? { ...i, question: event.target.value } : i
                  );
                  update(block.id, { items } as Partial<Block>);
                }}
                className={`${inputClass} font-bold`}
              />
              <AutoTextarea
                value={item.answer}
                placeholder="Resposta curta e direta"
                onChange={(event) => {
                  const items = block.items.map((i, i2) =>
                    i2 === itemIndex ? { ...i, answer: event.target.value } : i
                  );
                  update(block.id, { items } as Partial<Block>);
                }}
                className="rounded-lg border border-white/10 bg-surface-container p-2 text-sm text-on-surface"
              />
              {block.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    update(block.id, {
                      items: block.items.filter((_, i2) => i2 !== itemIndex),
                    } as Partial<Block>)
                  }
                  className="text-[11px] text-rose-300"
                >
                  Remover pergunta
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update(block.id, {
                items: [...block.items, { question: '', answer: '' }],
              } as Partial<Block>)
            }
            className="rounded bg-white/10 px-2 py-1 text-[11px] text-on-surface"
          >
            + pergunta
          </button>
        </div>
      );
  }
};
