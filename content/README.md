# content/

## posts.json

Arquivo com os artigos do blog usado **no build**, para gerar:

- uma página HTML estática por artigo (`dist/blog/<slug>/index.html`);
- `sitemap.xml` e `rss.xml`.

### Por que este arquivo existe

O site é um app React. WhatsApp, Facebook e LinkedIn leem o HTML **sem
executar JavaScript** — se o artigo só existir depois que o JavaScript roda,
todo link de artigo compartilhado no WhatsApp mostra a prévia da página
inicial em vez da prévia do artigo. O gerador roda no Node, fora do
navegador, então precisa dos artigos como arquivo.

### Como atualizar

1. Abra `/admin`, aba **Blog**.
2. Clique em **Exportar para o build**.
3. Salve o `posts.json` baixado aqui, em `content/posts.json`.
4. Faça o commit e publique o site.

Se o Supabase estiver configurado (`VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`), o build lê os artigos publicados direto de lá e
este arquivo passa a ser opcional — ele continua servindo como reserva para
quando o build roda sem acesso ao banco.
