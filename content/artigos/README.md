# content/artigos/

Um arquivo `.md` por artigo. O nome do arquivo é o endereço do artigo:
`como-organizar-whatsapp.md` vira `gustavoravel.com.br/blog/como-organizar-whatsapp`.

Estes arquivos são convertidos em artigos no build. **Quem escreve segue
`content/COMO-ESCREVER.md`** — este README é só o formato.

## Frontmatter

```markdown
---
title: "Como organizar o WhatsApp do seu salão em uma tarde"
description: "Entre 80 e 155 caracteres. É o que aparece no Google e na prévia do link no WhatsApp."
category: "Atendimento"
tags: [whatsapp business, salão, atendimento]
keyword: "whatsapp business para salão"
date: 2026-10-13
author: "Gustavo Ravel"
slug: "como-organizar-whatsapp-salao"
image: "/og-image.jpg"
imageAlt: "Descrição da imagem para quem não a vê"
status: publicado
---
```

| Campo | Obrigatório | Observação |
| --- | --- | --- |
| `title` | sim | Pode vir do `# Título` no corpo, em vez daqui |
| `description` | sim | Vazio = gerado do começo do texto, e fica pior |
| `category` | não | Padrão: `Atendimento` |
| `tags` | não | Lista. Aparecem no artigo e filtram a listagem |
| `keyword` | não | Termo principal. Só alimenta o checklist do editor |
| `date` | não | `AAAA-MM-DD`. Padrão: dia do build |
| `updated` | não | Data da última revisão de conteúdo |
| `author` | não | Padrão: `Gustavo Ravel` |
| `slug` | não | Padrão: nome do arquivo |
| `image` / `imageAlt` | não | Imagem destacada e a prévia do compartilhamento |
| `status` | não | `publicado` (padrão) ou `rascunho` |
| `noindex` | não | `true` esconde da busca sem tirar do ar |

**Sobre `status`:** o padrão é `publicado` porque o arquivo só chega ao
repositório depois de um Pull Request aprovado — a revisão já aconteceu. Use
`status: rascunho` para deixar um artigo parado aqui sem ir ao ar.

**Sobre `slug`:** depois que o artigo é publicado, não mude. O endereço é
permanente: mudar quebra os links já compartilhados e descarta o histórico que
o artigo acumulou na busca.

## O que o Markdown aceita

| Escreva | Vira |
| --- | --- |
| `## Título`, `### Subtítulo` | Seções (o `#` do topo é o título do artigo) |
| `- item` / `1. item` | Lista com marcador / numerada |
| `> trecho` + `> — Quem falou` | Citação com atribuição |
| `**negrito**`, `*itálico*`, `[texto](url)` | Formatação na linha |
| `![descrição](endereço)` | Imagem com texto alternativo |
| Link do YouTube/Vimeo sozinho na linha | Vídeo incorporado |
| Tabela no formato `\| A \| B \|` | Tabela |
| `---` | Divisória |
| ` ``` ` | Bloco de código |

**Vídeo:** basta a URL sozinha numa linha (`https://www.youtube.com/watch?v=...`).
Para o vídeo aparecer na busca por vídeos ele precisa de título e data, que o
Markdown não carrega — abra o artigo no editor do `/admin` para preencher, ou
deixe sem (o vídeo funciona normalmente, só não entra na busca de vídeos).

**Perguntas frequentes:** escreva como uma seção no fim. Para virarem resultado
expandido no Google (`FAQPage`), elas precisam ser blocos de FAQ — importe o
`.md` no editor do `/admin` e converta a seção, ou escreva o artigo direto lá.

## Quando o mesmo artigo existe em dois lugares

Se um `slug` aparece aqui **e** em `content/posts.json`, vale o `posts.json`.
É o caminho de promoção: pegou um artigo escrito pela automação, quis remontar
no editor de blocos, importou o `.md`, exportou o `posts.json` — a sua versão
passa a valer e este arquivo fica só como histórico.
