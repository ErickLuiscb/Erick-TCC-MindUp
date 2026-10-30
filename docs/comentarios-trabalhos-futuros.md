# Comentários nos conteúdos — trabalho futuro

> **Status:** adiado intencionalmente (decisão de 29/10/2026).
> **Resumo da decisão:** a ideia é viável tecnicamente, mas só faz sentido
> com denúncia e moderação. Isso é um módulo à parte, grande demais para
> o prazo do TCC e que muda o perfil da plataforma.

## 1. A ideia

Permitir que usuários comentem nos quatro tipos de conteúdo (vídeos,
artigos, sugestões e autoajuda), criando uma relação entre usuário e
psicólogo. Para manter o ambiente seguro, haveria um **botão de denunciar**
e o **administrador** trataria denúncias, comentários e usuários
problemáticos.

## 2. Por que ficou de fora

Os motivos estão em ordem de peso. O prazo é o último e não é o
determinante: mesmo com tempo, a funcionalidade não iria ao ar sem
moderação.

1. **Escopo e identidade do projeto.** O MindUp não é uma rede social: é uma
   plataforma de conteúdos de saúde mental, acessível e segura, em que todo
   conteúdo é publicado por psicólogos cadastrados. O objetivo é curadoria
   unidirecional, não interação social.
2. **Integridade da verificação de psicólogos.** A verificação do CRP existe
   para garantir que tudo que o usuário vê veio de um profissional
   conferido. Comentários introduziriam conteúdo de pessoas não verificadas
   dentro desse ambiente, enfraquecendo essa garantia. Hoje o único conteúdo
   de usuário são as anotações, que são privadas.
3. **Exposição de dados sensíveis.** Em saúde mental, um comentário público
   pode revelar crise, sofrimento ou dados pessoais de quem escreve. Seria
   dado pessoal sensível (LGPD, art. 5º, II) visível a todos.
4. **Responsabilidade do psicólogo.** Uma resposta pública pode ser lida
   como orientação clínica individual, o que mistura a plataforma com
   atendimento, algo fora do escopo e com implicações éticas.
5. **Moderação é um módulo próprio.** Sem a possibilidade de denunciar,
   remover e sancionar, a funcionalidade seria irresponsável. Com ela, o
   trabalho cresce bastante (ver seção 4).
6. **Prazo.** Fator real, citado por último.

## 3. Dimensionamento (feito sobre o código atual)

| Versão | O que inclui | Esforço aproximado |
|---|---|---|
| Mínima, **sem** moderação | tabela, listar, criar, excluir o próprio | cerca de 1 a 2 dias |
| Segura (a que seria exigida) | acima + denúncia, fila e painel do admin, sanções | vários dias, da ordem de uma semana (estimativa) |

O custo técnico da versão mínima é baixo porque já existe o padrão
polimórfico dos favoritos (`favoritavel_id` + `favoritavel_type`). O que
pesa é a governança.

## 4. Desenho mínimo para retomar

### Banco de dados

- `comentarios`: `id`, `usuario_id`, `comentavel_id`, `comentavel_type`,
  `texto` (limite de 500 caracteres), timestamps. Índice em
  (`comentavel_type`, `comentavel_id`).
- `denuncias`: `id`, `comentario_id`, `denunciante_id`, `motivo`,
  `status` (`aberta`, `procedente`, `improcedente`), `analisado_por`,
  `analisado_em`. Índice único (`comentario_id`, `denunciante_id`).
- Para sanção a usuário: campo de suspensão em `usuarios` (por exemplo,
  `comentarios_bloqueados_ate`).

### Backend

- `ComentarioApiController`: listar (paginado, por conteúdo), criar, excluir.
- `DenunciaApiController`: criar denúncia.
- Painel do admin: listar denúncias abertas, decidir, remover comentário,
  suspender usuário.
- **Autorização para excluir:** o autor do comentário, o psicólogo dono do
  conteúdo e o administrador.
- Os comentários **não** entram no `GET /bootstrap`: carregar por conteúdo,
  com paginação, para não pesar o carregamento inicial no Render gratuito.
- Exclusão em cascata: a relação polimórfica não tem chave estrangeira,
  então apagar um conteúdo precisa apagar seus comentários no código.
- Limitação de frequência (`throttle`): antes, configurar os proxies
  confiáveis (`trustProxies`) no Render, senão o Laravel enxerga o mesmo IP
  para todos e o limite vale para todos juntos.

### Frontend

- Componente `Comentarios` reutilizável, nas 4 telas `Ver_*`.
- Selo "Psicólogo" ao lado de quem é psicólogo aprovado.
- Aviso fixo abaixo da caixa: os comentários não substituem atendimento
  profissional, com CVV 188 e SAMU 192.
- Botão "Denunciar" em cada comentário.
- Tela do admin para a fila de denúncias.

### Regras de negócio sugeridas

- Comentários planos, sem respostas aninhadas.
- Sem edição (apenas excluir e reescrever).
- Visitante não comenta (o modo visitante não tem conta).
- Comentário denunciado por vários usuários pode ser ocultado
  automaticamente até a análise.

## 5. Decisões a tomar antes de retomar

1. Os comentários serão visíveis a todos os usuários ou só ao autor do
   conteúdo e a quem comentou?
2. Qual a política para quem escreve sobre crise (por exemplo, exibir o
   CVV, ocultar o comentário e avisar o autor)?
3. Qual a retenção e a base legal para tratar comentários que contenham
   dados de saúde? Em produção seria preciso orientação jurídica e termos
   de uso.
4. O psicólogo poderá responder? Em caso afirmativo, com qual aviso de que
   a resposta não é atendimento?

## 6. Impacto na documentação do TCC (quando for implementado)

- Diagrama de casos de uso: "Comentar Conteúdo", "Denunciar Comentário" e
  "Moderar Denúncias" (administrador).
- Diagrama de classes: `Comentario` e `Denuncia`.
- Matriz de rastreabilidade e plano de teste (partição de equivalência e
  valor limite no tamanho do texto: 0, 1, 500 e 501 caracteres).

## 7. Argumento para a defesa

> O MindUp foi concebido como plataforma de curadoria: todo conteúdo exibido
> foi publicado por um psicólogo cujo registro foi conferido por um
> administrador. Comentários trariam conteúdo de usuários não verificados
> para esse ambiente e expõem dados sensíveis, exigindo moderação,
> denúncia e política de responsabilidade que constituem um módulo próprio.
> Optou-se por não oferecer a funcionalidade sem essas proteções,
> registrando-a como trabalho futuro.

**Pergunta provável da banca:** "O sistema então não tem retorno dos
usuários?" Resposta: o retorno vem da avaliação de usabilidade (AttrakDiff)
e, em risco imediato, do apoio do CVV/SAMU no rodapé. A comunicação direta
com o psicólogo, quando existir, deve acontecer fora da plataforma (ver o
mapa de consultórios em `mapa-trabalhos-futuros.md`).
