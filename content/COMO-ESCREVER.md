# Como escrever um artigo para este blog

Este arquivo é a instrução para quem escreve os artigos — inclusive para o
agente de IA que roda semanalmente. Leia inteiro antes de escrever.

## Para quem você está escrevendo

Dono de pequeno negócio local ou autônomo: salão, barbearia, clínica pequena,
loja de bairro, prestador de serviço. Características que mudam tudo:

- **Desconfia de tecnologia.** Já contrataram alguém que sumiu no meio da
  configuração. Promessa grande soa como golpe.
- **Lê no celular**, muitas vezes entre um cliente e outro.
- **Não é da área.** Não sabe o que é API, CRM, webhook, funil, lead, no-code.
- **Não quer aprender a mexer.** Quer que funcione.

Escreva como quem explica para um amigo que entende do negócio dele e nada de
tecnologia. Sem soar como manual.

## Regras que não se quebram

Estas não são preferências de estilo. Quebrar qualquer uma delas cria uma
promessa que o serviço não cumpre, ou destrói a confiança que o site inteiro
foi construído para ganhar.

1. **Nunca prometa lembrete automático por WhatsApp.** Pelo aplicativo do
   celular isso não existe, e pela Cloud API cada mensagem de template tem
   custo por envio — o que quebraria a margem de um serviço de pagamento único.
   O que reduz falta **sem custo por mensagem** é o convite que entra na agenda
   do próprio cliente (ele mesmo avisa) e a confirmação por e-mail. É isso que
   pode ser dito.
2. **Nunca invente número, porcentagem, estatística, depoimento, nome de
   cliente ou caso de sucesso.** Não existe cliente para citar ainda. Os
   exemplos do site são declaradamente demonstrações de protótipo. Se um dado
   ajudaria o argumento e você não tem fonte real e verificável, escreva o
   argumento sem o dado.
3. **Pagamento único.** Não existe mensalidade, não existe fidelidade. Nunca
   escreva "plano mensal", "assinatura" ou "a partir de X por mês".
4. **As contas ficam no nome do cliente**, com os acessos dele. Nada fica
   preso com o Gustavo. Isso é o argumento central contra a desconfiança — use
   quando for natural, não force.
5. **Prazo de 7 dias e a garantia**: se não estiver funcionando como combinado
   no prazo, a etapa não é cobrada. Não invente outro prazo nem outra garantia.
6. **Vocabulário proibido**, porque o público não reconhece: "Tech Concierge",
   "conciergerie", "gerente de automações com IA", "stack", "onboarding",
   "lead" (use "cliente" ou "contato"), "funil" (use "caminho do cliente"),
   "no-code", "workflow", "deploy", "dashboard".
7. **Benefício primeiro, ferramenta depois.** O cliente não compra uma agenda
   online; ele compra parar de trocar oito mensagens para marcar um horário.
   Nomes de ferramenta só entram se forem necessários para a pessoa agir.
8. **Nada de promessa de resultado financeiro.** Nunca "dobre seu
   faturamento", "ganhe X clientes por mês".

## Estrutura do artigo

- **Entre 900 e 1.400 palavras.** Abaixo de ~300 o Google trata como raso;
  acima de ~1.500 o leitor no celular desiste.
- **Primeiro parágrafo**: descreva a situação que a pessoa vive, com o termo
  principal dentro dele, de forma natural. Sem "neste artigo você vai
  aprender".
- **Seções em H2** (`##`), subdivisões em H3 (`###`). O H1 é o título do
  artigo e sai do `#` único no topo — não escreva outro.
- **Parágrafos curtos**, de 2 a 4 linhas. Frase longa no celular vira parede.
- **Pelo menos uma lista** com passos concretos que a pessoa consegue executar
  sozinha hoje. O artigo precisa entregar valor de graça; é isso que faz a
  pessoa confiar o suficiente para contratar.
- **Termine com as perguntas frequentes**, no formato de FAQ abaixo. Elas
  viram resultado expandido na busca.
- **Um link interno**, no corpo, para `/blog/<outro-artigo>` ou para `/#planos`
  / `/#diagnostico`. É o que faz o buscador percorrer o site.
- **Encerre sem pressão.** Um convite tranquilo, no tom de "se quiser que eu
  faça isso para você". Nunca urgência falsa ("últimas vagas", "só hoje").

## SEO: o que é obrigatório

O termo principal (campo `keyword` do frontmatter) precisa aparecer:

- no título;
- no endereço do artigo (`slug`);
- no primeiro parágrafo;
- em pelo menos um título de seção (H2).

E **não** aparecer de forma forçada: repetir acima de ~3% do texto é tratado
como tentativa de manipular a busca. Escreva para a pessoa; o termo entra
naturalmente porque o artigo é sobre aquilo.

A `description` do frontmatter tem entre 80 e 155 caracteres e precisa fazer
sentido lida sozinha, fora do artigo: ela é o que aparece no resultado do
Google e na prévia do link no WhatsApp.

## Formato do arquivo

Um arquivo por artigo, em `content/artigos/<slug>.md`. O conteúdo é Markdown
comum. Veja `content/artigos/README.md` para a especificação completa dos
campos do frontmatter e dos recursos aceitos (vídeo, tabela, aviso em
destaque, perguntas frequentes).

## Antes de entregar, confira

- [ ] Nenhuma das sete regras acima foi quebrada.
- [ ] Nenhum número ou depoimento inventado.
- [ ] O termo principal está no título, no slug, no primeiro parágrafo e num H2.
- [ ] `description` entre 80 e 155 caracteres.
- [ ] Tem lista com passos que a pessoa executa sozinha.
- [ ] Tem perguntas frequentes no fim.
- [ ] Tem um link interno.
- [ ] Nenhuma palavra da lista de vocabulário proibido.
- [ ] Lido em voz alta, soa como uma pessoa explicando — não como manual nem
      como texto de IA.
