-- Blog: conteúdo em blocos, metadados de busca e permissão de escrita.
--
-- Rode este arquivo no SQL Editor do Supabase (ou por `supabase db push`).
-- Tudo é idempotente: rodar duas vezes não quebra nada.
--
-- Três coisas acontecem aqui:
--   1. Colunas novas para o editor de blocos e para o SEO.
--   2. Políticas de ESCRITA. A tabela tinha RLS ligado e só política de
--      leitura, então todo upsert do painel admin era recusado em silêncio —
--      o artigo só existia no navegador em que foi escrito.
--   3. Índices para as consultas que a listagem e o build fazem.

-- 1. Colunas novas ---------------------------------------------------------

ALTER TABLE public.blog_posts
  -- Conteúdo estruturado do editor. `content` (Markdown) continua existindo
  -- como espelho, para exportar e para os artigos antigos.
  ADD COLUMN IF NOT EXISTS blocks JSONB,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
  -- Título e descrição de busca, termo principal, canônica, imagem de
  -- compartilhamento e noindex. Em JSONB para não migrar a tabela a cada
  -- campo novo de SEO.
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at DATE;

-- Artigo novo nasce como rascunho: publicar passa a ser um ato explícito.
ALTER TABLE public.blog_posts ALTER COLUMN is_published SET DEFAULT false;

UPDATE public.blog_posts SET updated_at = published_at WHERE updated_at IS NULL;

-- 2. Escrita restrita a quem está autenticado -------------------------------

DROP POLICY IF EXISTS "Allow authenticated insert on posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated insert on posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update on posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated update on posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete on posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated delete on posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (true);

-- O painel precisa enxergar os rascunhos; o público, só o que está publicado.
DROP POLICY IF EXISTS "Allow authenticated read on posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated read on posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (true);

-- 3. Índices ---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON public.blog_posts (is_published, published_at DESC);

CREATE INDEX IF NOT EXISTS blog_posts_category_idx
  ON public.blog_posts (category);
