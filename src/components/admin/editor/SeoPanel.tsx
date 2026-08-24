import React from 'react';
import { AlertTriangle, Check, Search, X } from 'lucide-react';
import type { BlogPost } from '../../../types';
import type { Block, PostSeo } from '../../../types.blocks';
import { blocksToPlainText, countWords, stripInline } from '../../../lib/blocks';
import { metaDescriptionFor, metaTitleFor, postUrl } from '../../../lib/seo';

interface SeoPanelProps {
  post: Partial<BlogPost>;
  blocks: Block[];
  onChange: (seo: PostSeo) => void;
}

type CheckStatus = 'ok' | 'warn' | 'fail';

interface Check {
  status: CheckStatus;
  label: string;
  /** Por que isso importa — sem isso o checklist vira superstição. */
  why: string;
}

/**
 * Checklist de SEO do artigo.
 *
 * Nenhum item aqui bloqueia a publicação: são avisos, não regras. O objetivo é
 * que o autor veja, antes de publicar, o que faz um artigo ser encontrado —
 * e decida com conhecimento se vale ignorar.
 */
function runChecks(post: Partial<BlogPost>, blocks: Block[]): Check[] {
  const checks: Check[] = [];
  const seo = post.seo || {};
  const keyword = (seo.focusKeyword || '').trim().toLowerCase();
  const title = (post.title || '').trim();
  const plain = blocksToPlainText(blocks);
  const words = countWords(plain);
  const lowerPlain = plain.toLowerCase();

  const metaTitle = post.title ? metaTitleFor(post as BlogPost) : '';
  checks.push({
    status: metaTitle.length === 0 ? 'fail' : metaTitle.length > 60 ? 'warn' : 'ok',
    label: `Título de busca: ${metaTitle.length} caracteres`,
    why: 'Acima de 60 o Google corta a frase no meio do resultado.',
  });

  const description = post.title ? metaDescriptionFor(post as BlogPost, blocks) : '';
  checks.push({
    status: description.length < 80 ? 'warn' : description.length > 160 ? 'warn' : 'ok',
    label: `Descrição de busca: ${description.length} caracteres`,
    why: 'Entre 80 e 155 caracteres é o que aparece inteiro no resultado.',
  });

  checks.push({
    status: keyword ? 'ok' : 'warn',
    label: keyword ? `Termo principal: "${keyword}"` : 'Sem termo principal definido',
    why: 'É a busca que você quer ganhar. Sem ele, os outros itens não têm como ser conferidos.',
  });

  if (keyword) {
    checks.push({
      status: title.toLowerCase().includes(keyword) ? 'ok' : 'warn',
      label: 'Termo principal no título',
      why: 'O título é o sinal mais forte de sobre o que é a página.',
    });

    checks.push({
      status: (post.slug || '').includes(keyword.replace(/\s+/g, '-')) ? 'ok' : 'warn',
      label: 'Termo principal no endereço (slug)',
      why: 'O endereço aparece no resultado da busca e é lido pelo buscador.',
    });

    const firstParagraph = blocks.find((b) => b.type === 'paragraph');
    checks.push({
      status:
        firstParagraph && firstParagraph.type === 'paragraph' &&
        stripInline(firstParagraph.text).toLowerCase().includes(keyword)
          ? 'ok'
          : 'warn',
      label: 'Termo principal no primeiro parágrafo',
      why: 'Confirma logo de cara que a página responde à busca que trouxe o leitor.',
    });

    const inHeading = blocks.some(
      (b) => b.type === 'heading' && b.text.toLowerCase().includes(keyword)
    );
    checks.push({
      status: inHeading ? 'ok' : 'warn',
      label: 'Termo principal em um título de seção',
      why: 'Mostra que o assunto é desenvolvido, não só citado.',
    });

    const occurrences = lowerPlain.split(keyword).length - 1;
    const density = words > 0 ? (occurrences * keyword.split(' ').length) / words : 0;
    checks.push({
      status: occurrences === 0 ? 'fail' : density > 0.03 ? 'warn' : 'ok',
      label: `Termo aparece ${occurrences}x no texto`,
      why: 'Repetir demais (acima de ~3% do texto) é tratado como tentativa de manipular a busca.',
    });
  }

  const headings = blocks.filter((b) => b.type === 'heading');
  checks.push({
    status: headings.length === 0 ? (words > 300 ? 'warn' : 'ok') : 'ok',
    label: `${headings.length} título(s) de seção`,
    why: 'Texto longo sem seções é difícil de ler no celular e de resumir para a busca.',
  });

  checks.push({
    status: words < 300 ? 'warn' : 'ok',
    label: `${words} palavras`,
    why: 'Abaixo de ~300 palavras costuma ser raso demais para competir na busca.',
  });

  const images = blocks.filter((b): b is Extract<Block, { type: 'image' }> => b.type === 'image');
  const missingAlt = images.filter((b) => !b.alt.trim()).length;
  if (images.length > 0) {
    checks.push({
      status: missingAlt > 0 ? 'fail' : 'ok',
      label:
        missingAlt > 0
          ? `${missingAlt} imagem(ns) sem descrição`
          : 'Todas as imagens têm descrição',
      why: 'Sem descrição a imagem não entra no Google Imagens e o leitor de tela não lê nada.',
    });
  }

  const videos = blocks.filter((b): b is Extract<Block, { type: 'video' }> => b.type === 'video');
  if (videos.length > 0) {
    const incomplete = videos.filter((b) => !b.title.trim() || !b.uploadDate).length;
    checks.push({
      status: incomplete > 0 ? 'warn' : 'ok',
      label:
        incomplete > 0
          ? `${incomplete} vídeo(s) sem título ou data`
          : `${videos.length} vídeo(s) prontos para a busca`,
      why: 'Título e data de publicação são exigidos para o vídeo aparecer na busca por vídeos.',
    });
  }

  const internalLink = blocks.some(
    (b) => b.type === 'paragraph' && /\]\((\/|https:\/\/gustavoravel)/.test(b.text)
  );
  checks.push({
    status: internalLink ? 'ok' : 'warn',
    label: internalLink ? 'Tem link para outra página do site' : 'Sem link interno',
    why: 'Link para outro artigo ou para a página de planos faz o buscador percorrer o site.',
  });

  checks.push({
    status: (post.featuredImage || '').trim() ? 'ok' : 'warn',
    label: (post.featuredImage || '').trim() ? 'Tem imagem de compartilhamento' : 'Sem imagem de compartilhamento',
    why: 'É a prévia que aparece quando o link é colado no WhatsApp. Sem ela, o link vira só texto.',
  });

  return checks;
}

const STATUS_ICON = {
  ok: { icon: Check, className: 'text-emerald-400' },
  warn: { icon: AlertTriangle, className: 'text-amber-300' },
  fail: { icon: X, className: 'text-rose-400' },
} as const;

const inputClass =
  'w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none';

export const SeoPanel: React.FC<SeoPanelProps> = ({ post, blocks, onChange }) => {
  const seo = post.seo || {};
  const checks = runChecks(post, blocks);
  const failures = checks.filter((c) => c.status !== 'ok').length;

  const previewTitle = post.title ? metaTitleFor(post as BlogPost) : 'Título do artigo';
  const previewDescription = post.title
    ? metaDescriptionFor(post as BlogPost, blocks)
    : 'A descrição aparece aqui.';

  const set = (patch: Partial<PostSeo>) => onChange({ ...seo, ...patch });

  return (
    <div className="space-y-5">
      {/* Prévia do resultado de busca: mostra o que o cliente realmente vê. */}
      <section className="rounded-xl border border-white/10 bg-surface-container-lowest p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          <Search className="h-3.5 w-3.5" />
          Como aparece no Google
        </p>
        <p className="text-xs text-emerald-300">{postUrl(post.slug || 'endereco-do-artigo')}</p>
        <p className="text-lg leading-snug text-[#8ab4f8]">{previewTitle}</p>
        <p className="text-sm leading-snug text-on-surface-variant">{previewDescription}</p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-xs font-bold uppercase text-on-surface-variant">
          Termo principal
          <input
            type="text"
            value={seo.focusKeyword || ''}
            onChange={(event) => set({ focusKeyword: event.target.value })}
            placeholder="ex.: whatsapp business para salão"
            className={inputClass}
          />
        </label>

        <label className="space-y-1 text-xs font-bold uppercase text-on-surface-variant">
          Título de busca (opcional)
          <input
            type="text"
            value={seo.metaTitle || ''}
            onChange={(event) => set({ metaTitle: event.target.value })}
            placeholder="Vazio = usa o título do artigo"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block space-y-1 text-xs font-bold uppercase text-on-surface-variant">
        Descrição de busca (opcional)
        <textarea
          rows={2}
          value={seo.metaDescription || ''}
          onChange={(event) => set({ metaDescription: event.target.value })}
          placeholder="Vazio = usa o resumo do artigo"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-xs font-bold uppercase text-on-surface-variant">
          Imagem de compartilhamento (1200x630)
          <input
            type="url"
            value={seo.ogImage || ''}
            onChange={(event) => set({ ogImage: event.target.value })}
            placeholder="Vazio = usa a imagem destacada"
            className={inputClass}
          />
        </label>

        <label className="space-y-1 text-xs font-bold uppercase text-on-surface-variant">
          URL canônica (opcional)
          <input
            type="url"
            value={seo.canonicalUrl || ''}
            onChange={(event) => set({ canonicalUrl: event.target.value })}
            placeholder="Só se o artigo saiu antes em outro site"
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-start gap-2 text-xs text-on-surface-variant">
        <input
          type="checkbox"
          checked={Boolean(seo.noindex)}
          onChange={(event) => set({ noindex: event.target.checked })}
          className="mt-0.5"
        />
        <span>
          <strong className="text-on-surface">Esconder da busca</strong> — o artigo continua no ar
          pelo link, mas pede aos buscadores para não listá-lo.
        </span>
      </label>

      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Checklist {failures === 0 ? '— tudo certo' : `— ${failures} ponto(s) a melhorar`}
        </p>
        <ul className="space-y-1.5">
          {checks.map((check, index) => {
            const { icon: Icon, className } = STATUS_ICON[check.status];
            return (
              <li key={index} className="flex items-start gap-2 text-xs">
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${className}`} />
                <span>
                  <span className="text-on-surface">{check.label}</span>
                  <span className="block text-[11px] text-on-surface-variant">{check.why}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
