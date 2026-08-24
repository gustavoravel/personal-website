import React, { useMemo, useState } from 'react';
import { Download, Eye, FileText, Save, Search, Upload, X } from 'lucide-react';
import type { BlogPost, SiteSettings } from '../../../types';
import type { Block, PostSeo } from '../../../types.blocks';
import { createBlock, estimateReadTime, slugify } from '../../../lib/blocks';
import { blocksToMarkdown } from '../../../lib/markdown';
import { deriveExcerpt, normalizePost, postBlocks, uniqueSlug } from '../../../lib/post';
import { BlockRenderer } from '../../blog/BlockRenderer';
import { BlockEditor } from './BlockEditor';
import { MarkdownImportModal, type MarkdownImportResult } from './MarkdownImportModal';
import { SeoPanel } from './SeoPanel';

interface PostEditorProps {
  /** `null` = artigo novo. */
  post: BlogPost | null;
  posts: BlogPost[];
  settings: SiteSettings;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

type Tab = 'conteudo' | 'seo' | 'previa';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none';

const labelClass = 'block space-y-1 text-xs font-bold uppercase text-on-surface-variant';

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  posts,
  settings,
  onSave,
  onCancel,
}) => {
  const [draft, setDraft] = useState<Partial<BlogPost>>(
    () =>
      post || {
        title: '',
        category: 'Atendimento',
        author: 'Gustavo Ravel',
        tags: [],
        isPublished: false,
        seo: {},
      }
  );
  const [blocks, setBlocks] = useState<Block[]>(() =>
    post ? postBlocks(post) : [createBlock('paragraph')]
  );
  const [tab, setTab] = useState<Tab>('conteudo');
  const [importing, setImporting] = useState(false);
  const [dirty, setDirty] = useState(false);

  /**
   * O slug só acompanha o título enquanto o artigo é rascunho. Depois de
   * publicado ele é o endereço que o Google já indexou e que o cliente já pode
   * ter compartilhado — mudar joga fora o histórico do artigo.
   */
  const slugLocked = Boolean(post?.isPublished);

  const setField = <K extends keyof BlogPost>(key: K, value: BlogPost[K]) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === 'title' && !slugLocked) {
        next.slug = uniqueSlug(String(value), posts, current.id);
      }
      return next;
    });
    setDirty(true);
  };

  const changeBlocks = (next: Block[]) => {
    setBlocks(next);
    setDirty(true);
  };

  const readTime = useMemo(() => estimateReadTime(blocks), [blocks]);

  const previewPost = useMemo(
    () =>
      ({
        ...draft,
        title: draft.title || 'Artigo sem título',
        slug: draft.slug || 'sem-endereco',
        excerpt: draft.excerpt || deriveExcerpt(blocks),
        readTime,
      }) as BlogPost,
    [draft, blocks, readTime]
  );

  const save = (publish: boolean) => {
    const normalized = normalizePost({ ...draft, isPublished: publish }, blocks, posts);
    setDraft(normalized);
    setDirty(false);
    onSave(normalized);
  };

  const applyImport = (result: MarkdownImportResult, mode: 'replace' | 'append') => {
    changeBlocks(mode === 'replace' ? result.blocks : [...blocks, ...result.blocks]);

    setDraft((current) => ({
      ...current,
      title: current.title || result.title || '',
      slug:
        current.slug ||
        (result.title ? uniqueSlug(result.title, posts, current.id) : current.slug),
      excerpt: current.excerpt || result.excerpt || '',
      category: current.category || result.category || 'Atendimento',
      tags: (current.tags || []).length > 0 ? current.tags : result.tags || [],
    }));

    setImporting(false);
  };

  /** Baixa o artigo em .md — backup e reaproveitamento fora do site. */
  const exportMarkdown = () => {
    const frontmatter = [
      '---',
      `title: "${(draft.title || '').replace(/"/g, "'")}"`,
      `description: "${(draft.excerpt || deriveExcerpt(blocks)).replace(/"/g, "'")}"`,
      `category: "${draft.category || ''}"`,
      `tags: [${(draft.tags || []).map((t) => `"${t}"`).join(', ')}]`,
      `date: ${draft.publishedAt || new Date().toISOString().split('T')[0]}`,
      '---',
      '',
    ].join('\n');

    const blob = new Blob([`${frontmatter}# ${draft.title || ''}\n\n${blocksToMarkdown(blocks)}\n`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draft.slug || 'artigo'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
        <h2 className="mr-auto text-xl font-bold text-on-surface">
          {post ? 'Editar artigo' : 'Novo artigo'}
          {dirty && <span className="ml-2 text-xs font-normal text-amber-300">não salvo</span>}
        </h2>

        <button
          type="button"
          onClick={() => setImporting(true)}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-on-surface"
        >
          <Upload className="h-4 w-4" />
          <span>Colar Markdown</span>
        </button>

        <button
          type="button"
          onClick={exportMarkdown}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-on-surface"
        >
          <Download className="h-4 w-4" />
          <span>Baixar .md</span>
        </button>

        <button
          type="button"
          onClick={() => save(false)}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-on-surface"
        >
          <Save className="h-4 w-4" />
          <span>Salvar rascunho</span>
        </button>

        <button
          type="button"
          onClick={() => save(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
        >
          <Save className="h-4 w-4" />
          <span>{draft.isPublished ? 'Salvar e manter publicado' : 'Publicar'}</span>
        </button>

        <button type="button" onClick={onCancel} aria-label="Fechar editor">
          <X className="h-5 w-5 text-on-surface-variant hover:text-on-surface" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <label className={`${labelClass} md:col-span-2`}>
          Título do artigo
          <input
            type="text"
            value={draft.title || ''}
            onChange={(event) => setField('title', event.target.value)}
            placeholder="Como organizar o WhatsApp do seu salão em uma tarde"
            className={`${inputClass} text-base font-bold`}
          />
        </label>

        <label className={labelClass}>
          Categoria
          <input
            type="text"
            value={draft.category || ''}
            onChange={(event) => setField('category', event.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Data de publicação
          <input
            type="date"
            value={draft.publishedAt || new Date().toISOString().split('T')[0]}
            onChange={(event) => setField('publishedAt', event.target.value)}
            className={inputClass}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Endereço do artigo (slug)
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[11px] normal-case text-on-surface-variant">
              /blog/
            </span>
            <input
              type="text"
              value={draft.slug || ''}
              onChange={(event) => setField('slug', slugify(event.target.value))}
              disabled={slugLocked}
              className={`${inputClass} disabled:opacity-60`}
            />
          </div>
          {slugLocked && (
            <span className="block text-[11px] normal-case text-on-surface-variant">
              Travado porque o artigo já está publicado: mudar o endereço apaga o histórico dele na
              busca e quebra os links já compartilhados.
            </span>
          )}
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Tags (separadas por vírgula)
          <input
            type="text"
            value={(draft.tags || []).join(', ')}
            onChange={(event) =>
              setField(
                'tags',
                event.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              )
            }
            placeholder="whatsapp business, agenda online, salão"
            className={inputClass}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Imagem destacada (URL)
          <input
            type="url"
            value={draft.featuredImage || ''}
            onChange={(event) => setField('featuredImage', event.target.value)}
            className={inputClass}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Descrição da imagem destacada
          <input
            type="text"
            value={draft.featuredImageAlt || ''}
            onChange={(event) => setField('featuredImageAlt', event.target.value)}
            className={inputClass}
          />
        </label>

        <label className={`${labelClass} md:col-span-4`}>
          Resumo (aparece na listagem e na prévia do WhatsApp)
          <textarea
            rows={2}
            value={draft.excerpt || ''}
            onChange={(event) => setField('excerpt', event.target.value)}
            placeholder={deriveExcerpt(blocks) || 'Vazio = gerado do começo do artigo'}
            className={inputClass}
          />
        </label>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {(
          [
            ['conteudo', 'Conteúdo', FileText],
            ['seo', 'Busca e compartilhamento', Search],
            ['previa', 'Prévia', Eye],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tab === value
                ? 'bg-primary text-on-primary'
                : 'glass-panel text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}

        <span className="ml-auto self-center text-[11px] text-on-surface-variant">
          {readTime} de leitura · {blocks.length} blocos
        </span>
      </nav>

      {tab === 'conteudo' && <BlockEditor blocks={blocks} onChange={changeBlocks} />}

      {tab === 'seo' && (
        <SeoPanel
          post={draft}
          blocks={blocks}
          onChange={(seo: PostSeo) => {
            setDraft((current) => ({ ...current, seo }));
            setDirty(true);
          }}
        />
      )}

      {tab === 'previa' && (
        <article className="rounded-2xl border border-white/10 bg-surface-container-low p-6 md:p-10">
          <h1 className="text-3xl font-extrabold text-on-surface">{previewPost.title}</h1>
          <p className="mt-3 text-lg text-on-surface-variant">{previewPost.excerpt}</p>
          <hr className="my-6 border-white/10" />
          <BlockRenderer
            blocks={blocks}
            onCtaClick={(block) =>
              window.open(
                `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  block.whatsappMessage || previewPost.title
                )}`,
                '_blank',
                'noopener,noreferrer'
              )
            }
          />
        </article>
      )}

      {importing && (
        <MarkdownImportModal onClose={() => setImporting(false)} onImport={applyImport} />
      )}
    </div>
  );
};
