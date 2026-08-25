import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import type { Block } from '../../types.blocks';
import { headingAnchor, isEmptyBlock } from '../../lib/blocks';
import { inlineToHtml, sanitizeSrc } from '../../lib/markdown';
import { VideoEmbed } from './VideoEmbed';

/**
 * Renderiza os blocos do artigo em HTML semântico.
 *
 * "Semântico" aqui é requisito de SEO, não capricho: título de seção precisa
 * ser <h2>/<h3> na ordem certa, lista precisa ser <ul>/<ol>, citação precisa
 * ser <blockquote> e imagem precisa de <figure> + alt. É isso que o
 * buscador lê para entender do que trata o artigo.
 *
 * O HTML gerado aqui é o mesmo que `src/lib/staticRender.ts` produz no build,
 * para a página estática e a versão em React não divergirem.
 */

/** Texto com formatação em linha (negrito, itálico, link, código). */
const Inline: React.FC<{ text: string; as?: 'span' | 'p' | 'div' }> = ({ text, as = 'span' }) => {
  const Tag = as;
  return <Tag dangerouslySetInnerHTML={{ __html: inlineToHtml(text) }} />;
};

const CALLOUT_STYLES = {
  info: {
    icon: Info,
    box: 'border-primary/40 bg-primary/10',
    accent: 'text-primary',
  },
  warning: {
    icon: AlertTriangle,
    box: 'border-amber-400/40 bg-amber-400/10',
    accent: 'text-amber-300',
  },
  success: {
    icon: CheckCircle2,
    box: 'border-emerald-400/40 bg-emerald-400/10',
    accent: 'text-emerald-300',
  },
} as const;

interface BlockRendererProps {
  blocks: Block[];
  /** Recebe o clique do bloco de chamada — quem decide o destino é o artigo. */
  onCtaClick?: (block: Extract<Block, { type: 'cta' }>) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onCtaClick }) => (
  <>
    {blocks.filter((block) => !isEmptyBlock(block)).map((block) => (
      <BlockView key={block.id} block={block} onCtaClick={onCtaClick} />
    ))}
  </>
);

const BlockView: React.FC<{
  block: Block;
  onCtaClick?: (block: Extract<Block, { type: 'cta' }>) => void;
}> = ({ block, onCtaClick }) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="my-5 text-[1.05rem] leading-[1.75] text-on-surface">
          <Inline text={block.text} />
        </p>
      );

    case 'heading': {
      const id = block.anchor || headingAnchor(block.text, block.id);
      const common = 'scroll-mt-28 font-extrabold text-on-surface';
      if (block.level === 2) {
        return (
          <h2 id={id} className={`${common} mt-12 mb-4 text-2xl md:text-3xl`}>
            <Inline text={block.text} />
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 id={id} className={`${common} mt-9 mb-3 text-xl md:text-2xl`}>
            <Inline text={block.text} />
          </h3>
        );
      }
      return (
        <h4 id={id} className={`${common} mt-7 mb-2 text-lg`}>
          <Inline text={block.text} />
        </h4>
      );
    }

    case 'list': {
      const items = block.items.filter((item) => item.trim() !== '');
      const className = 'my-5 space-y-2 pl-6 text-[1.05rem] leading-[1.7] text-on-surface';
      return block.ordered ? (
        <ol className={`${className} list-decimal marker:text-primary marker:font-bold`}>
          {items.map((item, index) => (
            <li key={index}>
              <Inline text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className={`${className} list-disc marker:text-primary`}>
          {items.map((item, index) => (
            <li key={index}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    }

    case 'quote':
      return (
        <blockquote className="my-7 border-l-4 border-primary bg-surface-container-low py-4 pl-5 pr-4 rounded-r-xl">
          <p className="text-lg italic leading-relaxed text-on-surface">
            <Inline text={block.text} />
          </p>
          {block.citation && (
            <cite className="mt-2 block text-sm not-italic text-on-surface-variant">
              — {block.citation}
            </cite>
          )}
        </blockquote>
      );

    case 'code':
      return (
        <pre className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-surface-container-lowest p-4 text-sm">
          <code className="font-mono text-on-surface">{block.code}</code>
        </pre>
      );

    case 'image': {
      const src = sanitizeSrc(block.src);
      if (!src) return null;
      return (
        <figure className={`my-8 ${block.width === 'wide' ? 'md:-mx-12' : ''}`}>
          <img
            src={src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-2xl border border-white/10"
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-on-surface-variant">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'video':
      return <VideoEmbed block={block} />;

    case 'callout': {
      const style = CALLOUT_STYLES[block.tone];
      const Icon = style.icon;
      return (
        <aside className={`my-7 flex gap-3 rounded-2xl border p-5 ${style.box}`}>
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.accent}`} aria-hidden="true" />
          <div>
            {block.title && (
              <p className={`mb-1 font-bold ${style.accent}`}>
                <Inline text={block.title} />
              </p>
            )}
            <p className="leading-relaxed text-on-surface">
              <Inline text={block.text} />
            </p>
          </div>
        </aside>
      );
    }

    case 'divider':
      return <hr className="my-10 border-white/10" />;

    case 'cta':
      return (
        <aside className="my-9 rounded-2xl border border-primary/30 bg-surface-container-high p-6">
          <h3 className="text-lg font-bold text-on-surface">{block.title}</h3>
          {block.text && (
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              <Inline text={block.text} />
            </p>
          )}
          <button
            type="button"
            onClick={() => onCtaClick?.(block)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-105"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>{block.buttonText}</span>
          </button>
        </aside>
      );

    case 'table':
      return (
        <div className="my-7 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {block.header.map((cell, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="border-b border-white/10 bg-surface-container-low px-4 py-3 font-bold text-on-surface"
                  >
                    <Inline text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-b border-white/5 px-4 py-3 align-top text-on-surface-variant"
                    >
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'faq':
      return (
        <section className="my-9 space-y-3">
          {block.items
            .filter((item) => item.question.trim() !== '')
            .map((item, index) => (
              <details
                key={index}
                className="group rounded-xl border border-white/10 bg-surface-container-low p-4"
              >
                <summary className="cursor-pointer list-none font-bold text-on-surface">
                  <span className="mr-2 text-primary">?</span>
                  <Inline text={item.question} />
                </summary>
                <p className="mt-3 leading-relaxed text-on-surface-variant">
                  <Inline text={item.answer} />
                </p>
              </details>
            ))}
        </section>
      );
  }
};
