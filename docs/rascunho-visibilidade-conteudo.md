# Trabalho Futuro: Controle de Visibilidade de Conteúdos (Rascunho / Publicado)

## Ideia

Permitir que o psicólogo defina, ao publicar um conteúdo (vídeo, artigo,
sugestão ou autoajuda), se ele deve ficar imediatamente visível para os
usuários ou permanecer como rascunho — preparado, mas ainda não divulgado
publicamente. Isso dá ao profissional a liberdade de escrever, revisar e
ajustar um material com calma antes de disponibilizá-lo, sem precisar
publicá-lo pela metade ou fora de hora.

## Estado atual da base técnica

A estrutura de dados para essa funcionalidade já existe, pronta para ser
aproveitada:

- Os quatro modelos de conteúdo (`Video`, `Artigo`, `Sugestao`, `Autoajuda`)
  já possuem o campo `ativo` (boolean, com valor padrão `true`) nas
  respectivas migrations.
- Os quatro `Requests` de validação (`Store*Request` / `Update*Request`) já
  aceitam esse campo (`sometimes|required|boolean`).

## O que falta para funcionar de ponta a ponta

O ponto central de implementação é nos métodos `index()` e `show()` dos
quatro controllers (`VideoApiController`, `ArtigoApiController`,
`SugestaoApiController`, `AutoajudaApiController`):

1. **No `index()`** (listagem pública): filtrar `->where('ativo', true)`,
   para que rascunhos não apareçam nas telas de Vídeos, Artigos, Sugestões
   e Autoajuda para os usuários comuns.

2. **No `show()`** (detalhe de um item específico): aqui é preciso um
   cuidado extra, porque essa mesma rota é usada tanto pela tela pública de
   detalhe quanto pela tela de edição do próprio psicólogo (que precisa
   conseguir abrir e editar seus próprios rascunhos). A regra correta é:
   - Se o conteúdo está `ativo = true`, qualquer usuário autenticado pode
     visualizá-lo normalmente.
   - Se está `ativo = false`, só o autor do conteúdo (ou um administrador)
     pode acessá-lo — comparando `$request->user()->id` com o
     `usuario_id` do conteúdo.

3. **No frontend**: reintroduzir, nas telas de Criar/Editar dos quatro
   módulos, um seletor visual (ex.: "🟢 Publicar agora" / "⚪ Salvar como
   rascunho"), enviando o campo `ativo` no `FormData` do envio.

4. **Indicador visual no painel do psicólogo**: nas telas "Meus Vídeos",
   "Meus Artigos", "Minhas Sugestões" e "Minhas Autoajudas", adicionar um
   selo (badge) indicando se cada item está publicado ou em rascunho —
   ajuda o profissional a identificar rapidamente o que ainda não foi
   disponibilizado.

## Escopo estimado

Por afetar quatro módulos de forma idêntica, a implementação é repetitiva,
mas direta — o ajuste de `index()`/`show()` segue o mesmo padrão nos quatro
controllers, e o seletor do frontend também segue o mesmo componente visual
nos quatro formulários.
