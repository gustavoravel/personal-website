import React, { useState } from 'react';
import { Play } from 'lucide-react';
import type { VideoBlock } from '../../types.blocks';
import { videoEmbedUrl, videoThumbnail } from '../../lib/blocks';

/**
 * Vídeo dentro do artigo.
 *
 * Carrega uma capa e só troca pelo iframe depois do clique. Motivo: o player
 * do YouTube pesa mais de 1 MB, e o leitor deste blog costuma estar no 4G do
 * celular. Sem isso, um artigo com dois vídeos demora a abrir — e página
 * lenta cai na busca, além de perder o leitor antes do primeiro parágrafo.
 *
 * Só o `<iframe>` fica atrás do clique; o vídeo continua no HTML como
 * VideoObject (JSON-LD) e como link para o YouTube, então o buscador enxerga.
 */
interface VideoEmbedProps {
  block: VideoBlock;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ block }) => {
  const [playing, setPlaying] = useState(false);
  const thumbnail = videoThumbnail(block);
  const label = block.title || 'Assistir ao vídeo';

  if (block.provider === 'file') {
    return (
      <figure className="my-8">
        <video
          controls
          preload="metadata"
          poster={block.thumbnail || undefined}
          className="w-full rounded-2xl border border-white/10 bg-black"
        >
          <source src={block.url} />
          Seu navegador não consegue exibir este vídeo.{' '}
          <a href={block.url}>Baixe o arquivo</a> para assistir.
        </video>
        {block.caption && (
          <figcaption className="mt-3 text-center text-sm text-on-surface-variant">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-8">
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video">
        {playing ? (
          <iframe
            src={videoEmbedUrl(block)}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Assistir: ${label}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                onError={(event) => {
                  // maxresdefault não existe em todo vídeo; hqdefault sempre existe.
                  const img = event.currentTarget;
                  if (img.src.includes('maxresdefault')) {
                    img.src = img.src.replace('maxresdefault', 'hqdefault');
                  }
                }}
              />
            ) : (
              <div className="h-full w-full bg-surface-container" />
            )}

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </span>
            </span>

            {block.title && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-left text-base font-bold text-white">
                {block.title}
              </span>
            )}
          </button>
        )}
      </div>

      {block.caption && (
        <figcaption className="mt-3 text-center text-sm text-on-surface-variant">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
