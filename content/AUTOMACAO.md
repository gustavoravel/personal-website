# Automação de escrita do blog

## Como funciona

```
Rotina na nuvem (1x por semana)
  → lê content/pauta.md e pega o próximo assunto
  → lê content/COMO-ESCREVER.md e escreve o artigo
  → cria content/artigos/<slug>.md e marca o item na pauta
  → abre um Pull Request
        ↓
  VOCÊ APROVA: lê o PR e clica em "Merge"  ← único passo manual
        ↓
  Netlify publica sozinho
  → artigo no ar, página estática, sitemap.xml e rss.xml atualizados
```

A aprovação é o merge do Pull Request. Nada vai ao ar sem isso. Se o artigo
não prestar, você fecha o PR e nada acontece.

## Por que Pull Request, e não "publicar direto"

- **O diff é legível.** Um artigo em Markdown dá um diff que você lê no
  celular. O mesmo artigo em blocos (JSON) daria centenas de linhas ilegíveis.
- **Não precisa de senha nenhuma.** O agente escreve no repositório, não no
  banco. Nada de chave do Supabase guardada numa automação.
- **Dá para rejeitar sem sujeira.** Fechou o PR, acabou.
- **Fica histórico.** Cada artigo tem autor, data e revisão registrados.

## Se você quiser remontar o artigo no editor

O `.md` não tem bloco de vídeo com data, nem bloco de perguntas frequentes
(que gera resultado expandido no Google). Para isso:

1. `/admin` > Blog > **Colar Markdown** > escolha o arquivo do artigo.
2. Ajuste os blocos, preencha título e data do vídeo, converta as perguntas.
3. **Exportar para o build** > salve em `content/posts.json` > commit.

A partir daí a sua versão vale, porque `posts.json` ganha de `content/artigos/`
no mesmo slug. O `.md` fica como histórico.

## O prompt da rotina

Guardado aqui para poder ser ajustado sem depender de abrir o painel de
rotinas. Ao mudar, atualize a rotina em https://claude.ai/code/routines.

```
Você escreve um artigo novo para o blog do site deste repositório.

ANTES DE ESCREVER, leia nesta ordem:
1. content/COMO-ESCREVER.md — as regras de voz, as sete regras que não se
   quebram e o checklist final. Siga à risca; elas existem porque quebrá-las
   cria promessa que o serviço não cumpre.
2. content/artigos/README.md — o formato do arquivo e do frontmatter.
3. content/pauta.md — a fila de assuntos.
4. Pelo menos dois artigos já publicados, em content/artigos/*.md ou em
   content/posts.json, para pegar o tom.

ESCOLHA DO ASSUNTO:
Pegue o primeiro item não marcado da pauta, alternando entre a Trilha A e a
Trilha B: veja na seção "Escritos" de qual trilha veio o artigo mais recente e
escolha da outra trilha. Se a fila de uma trilha acabar, use a outra.

PESQUISA:
Pesquise na web antes de escrever, para o artigo não sair genérico nem
desatualizado. Confira especialmente o que mudou recentemente no WhatsApp
Business e nas ferramentas citadas. Não copie texto de nenhuma fonte.
Se encontrar um dado numérico que vale citar, cite a fonte com link; se não
tiver fonte verificável, escreva o argumento sem o número.

ENTREGA:
1. Crie content/artigos/<slug>.md com o frontmatter completo (title,
   description entre 80 e 155 caracteres, category, tags, keyword, date de
   hoje, slug, status: publicado).
2. Em content/pauta.md, marque o item como [x] e mova para "Escritos",
   com o endereço do artigo.
3. Rode `npm run blog:data` e confirme que o novo artigo aparece na contagem
   de publicados. Se der erro, corrija antes de abrir o PR.
4. Crie um branch chamado artigo/<slug>, faça o commit e abra um Pull Request
   para a branch main.

O PULL REQUEST deve ter:
- Título: "Artigo: <título do artigo>"
- Corpo com: o termo principal escolhido, a contagem de palavras, o
  checklist de content/COMO-ESCREVER.md com cada item marcado, e uma linha
  dizendo quais fontes foram consultadas na pesquisa.

NÃO faça merge do Pull Request. A aprovação é humana.
NÃO altere nenhum arquivo fora de content/artigos/ e content/pauta.md.
```

## Cadência

Um artigo por semana, segunda-feira de manhã. Dois por semana só depois de
você ver que a revisão de um está dando conta — artigo acumulado em PR aberto
não serve para nada, e revisar com pressa é como entra texto ruim no ar.

Para o segundo artigo por semana, duplique a rotina com outro dia (quinta) em
https://claude.ai/code/routines.

## O que a rotina NÃO faz

- Não publica. Só abre PR.
- Não mexe no código do site, só em `content/`.
- Não escreve sobre o que não está na pauta. Se a fila esvaziar, ela avisa no
  PR em vez de inventar assunto — mantenha a pauta alimentada.
