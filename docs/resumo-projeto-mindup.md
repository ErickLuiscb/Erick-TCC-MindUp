# Resumo do Projeto — MindUp (TCC)

> Documento de contexto para retomar o desenvolvimento em uma nova conversa
> com o Claude. Cole este arquivo (ou seu conteúdo) no início da conversa
> para que ele se atualize rapidamente sobre o estado do projeto.
>
> **Última atualização:** 29/10/2026 (inclui verificação de psicólogos,
> modo visitante, exportação de anotações em PDF, o ajuste do aviso do PDF
> dos artigos e as funcionalidades adiadas).

## O que é o projeto

**MindUp** é uma aplicação web de apoio à saúde mental (TCC), conectando
usuários comuns a conteúdos de autocuidado emocional publicados por
psicólogos cadastrados e verificados na plataforma. Tema sensível —
decisões de produto sempre priorizam responsabilidade sobre "ter mais uma
feature".

**Identidade do produto:** plataforma de **curadoria unidirecional** — todo
conteúdo exibido foi publicado por um psicólogo cujo CRP foi conferido por
um administrador. **Não é uma rede social** (não há comunicação direta entre
usuários e psicólogos). Essa identidade é o argumento central para as
funcionalidades adiadas (ver abaixo).

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite, Tailwind CSS 4, Axios, React Router 7, Context API, lucide-react |
| Backend | Laravel 12 (PHP 8.3), Sanctum (auth por token com *abilities*) |
| Banco de dados | PostgreSQL via Supabase (Session Pooler) |
| Armazenamento de mídia | Cloudinary (produção) / disco local (dev) — alternável via `FILESYSTEM_DISK` |
| E-mail transacional | Brevo, via API HTTPS (não SMTP) |
| Hospedagem backend | Render (Docker), plano gratuito |
| Hospedagem frontend | Netlify, plano gratuito |
| Testes | Coleções Postman (backend) e Cypress (E2E do frontend); PHPUnit ainda só com testes de exemplo |
| Repositório | GitHub, deploy automático em ambos os lados a cada push |

## Atores e permissões

| Ator | Como é criado | Permissão (ability no token) |
|---|---|---|
| Visitante | não tem conta | nenhuma — só a prévia pública (`/visitante`) |
| Usuário | cadastro público | login normal |
| Psicólogo | cadastro público, nasce `pendente` | `publicador` só se `crp_status = aprovado` |
| Administrador | promovido direto no banco (`is_admin`) | `admin` |

Hierarquia (modelagem): Usuário → Psicólogo e Usuário → Administrador. O
Visitante é um ator separado (não herda de Usuário). No banco há uma única
tabela `usuarios`; o papel é definido pelos atributos `tipo` e `is_admin`.

## Decisões de arquitetura importantes (não reverter sem motivo forte)

- **`config('filesystems.default')` em vez de `'public'` fixo**: todos os
  Controllers/Resources que lidam com arquivo usam essa chamada, controlada
  pela env var `FILESYSTEM_DISK` (`public` local / `cloudinary` produção).
  Não hardcodar o nome do disco em lugar nenhum.
- **`BootstrapContext` + rota `GET /bootstrap`**: no login, o frontend faz
  **uma única requisição** que traz categorias, vídeos, artigos, sugestões,
  autoajuda e favoritos de uma vez — em vez de cada Context buscar sozinho.
  Isso resolveu um bug sério de concorrência no Render gratuito. Tem
  proteção contra chamadas simultâneas/repetidas (cooldown de 8s). Só busca
  dados quando o usuário está autenticado.
- **Favoritos são polimórficos**: uma tabela `favoritos` aponta para
  qualquer um dos 4 tipos de conteúdo (`favoritavel_id` +
  `favoritavel_type`). O endpoint `POST /favoritos` é um **toggle real**
  (favorita se não existe, remove se já existe).
- **`api.js` (Axios)**: timeout de 20s padrão, 120s para uploads
  (detecta `FormData` automaticamente). Erros de timeout são marcados com
  `error.foiTimeout = true` para telas mostrarem mensagem honesta em vez de
  "erro genérico". **Atenção:** qualquer resposta 401 (fora do login) apaga
  o token e redireciona para `/login`.
- **PHP no Dockerfile do backend**: tem `PHP_CLI_SERVER_WORKERS=4` (evita
  travamento por concorrência do `php artisan serve`) e um `conf.d/uploads.ini`
  customizado com `upload_max_filesize`/`post_max_size` maiores (o PHP puro
  vem com limites baixíssimos que cortavam uploads grandes e pareciam erro
  de CORS no navegador — não é CORS, é limite de tamanho do PHP).
- **Padrão de nomenclatura em português** no backend: `senha` (não
  `password`), `humor`, `nome_consultorio`, etc. — os models têm
  `getAuthPassword()` retornando `$this->senha` para compatibilizar com o
  Laravel.
- **Funcionalidades novas entram isoladas e reversíveis** (padrão adotado
  no modo visitante): arquivos novos, poucos pontos de contato com o
  código existente, sem mexer na autenticação que já funciona.

## Módulos implementados e funcionando

- Autenticação: cadastro, login, **verificação de e-mail obrigatória**
  (link assinado do Laravel, válido 60min, usuários antigos foram
  auto-verificados na migration), recuperação de senha (mesmo padrão de
  link, 60min).
- **Verificação de psicólogos** (17/10/2026) — ver seção própria abaixo.
- **Modo visitante** (29/10/2026) — ver seção própria abaixo.
- **Exportação de anotações em PDF** (29/10/2026) — ver seção própria abaixo.
- Vídeos, Artigos (PDF), Sugestões (livro/filme/série/etc.), Autoajuda
  (imagem ou vídeo) — cada um com tela pública para usuários logados +
  CRUD do psicólogo aprovado.
- Categorias: seed fixo (~89), tela somente-leitura para o psicólogo
  consultar.
- Anotações pessoais (diário), com campo opcional de **humor** (8 emojis,
  lista centralizada em `app/Support/Humores.php` + `utils/humores.js`).
- Favoritos: tela unificada com filtro por tipo + categoria, atalhos
  contextuais nas 4 telas de conteúdo.
- Nota de apoio no rodapé (CVV 188 / SAMU 192), sempre acessível, discreta
  (componente `footer.jsx`, independente de login).

## Verificação de psicólogos (documentada em PDF próprio)

Documento: *"MindUp — Verificação de psicólogos: documentação das
alterações"* (17/10/2026), com regras de negócio RN01–RN15.

- Validação automática de formato no cadastro (região do CRP 1–23, número
  do CRP, CPF com dígitos verificadores). CRP único por região.
- **Aprovação manual** pelo administrador no Cadastro Nacional do CFP (não
  há API pública oficial; a consulta tem reCAPTCHA; automatizar fica como
  trabalho futuro).
- Estados: `pendente` → `aprovado` | `rejeitado`; `aprovado` → `rejeitado`
  (revogar, com motivo); `rejeitado` → `aprovado` (reativar).
- Toda decisão: **apaga o CPF** (guardado criptografado), registra quem
  decidiu/quando/motivo, **apaga os tokens** do psicólogo e envia e-mail.
- Telas: `/admin/psicologos` (abas Pedidos e Psicólogos), aviso de status
  no Painel do Profissional, cartões bloqueados enquanto não aprovado.
- Segurança: o cadastro público deixou de aceitar `is_admin` e `role`; o
  CRP não pode ser alterado pelo perfil.
- Limitações já documentadas: aprovação manual não escala; conteúdo de
  psicólogo revogado continua visível; administrador ainda pode publicar;
  CPF não é único; auditoria guarda só a última decisão.

## Modo visitante (prévia pública)

- **Objetivo:** reduzir a barreira do cadastro. O visitante vê uma prévia e,
  para ver mais ou usar qualquer funcionalidade, recebe o aviso "Para
  conhecer mais, faça cadastro ou login".
- **Backend:** `GET /visitante/conteudos` (pública), no
  `VisitanteApiController`: **3 conteúdos mais recentes de cada tipo**, em
  formato próprio. **Não envia nenhum dado de psicólogo** (nem nome nem
  e-mail) e não envia `favoritado`. Cache de 120 segundos. **Sem `throttle`
  de propósito:** o `bootstrap/app.php` não configura `trustProxies`, e
  atrás do balanceador do Render o Laravel provavelmente veria o mesmo IP
  para todos, limitando todos os visitantes juntos.
- **Frontend:** rota pública `/visitante` → `pages/visitante/Visitante.jsx`
  (arquivo novo, **sem Layout, Header ou BootstrapContext**). 4 seções com 3
  cards cada, que abrem em modal (vídeo toca, artigo abre o PDF, sugestão
  mostra capa e link externo, autoajuda mostra imagem ou vídeo). Botão "Ver
  mais" abaixo de cada seção abre o aviso de cadastro/login. Quem já está
  logado é redirecionado para `/inicial`.
- **Pontos de contato com código existente** (para remover o recurso, basta
  desfazer): rota em `routes/api.php`, rota e import em `App.jsx`, botão
  "Entrar como visitante" em `Login.jsx`.
- Acessibilidade e responsividade seguem o padrão do projeto: foco visível,
  cards por teclado, modais com `role="dialog"`, Esc, foco preso, `motion-reduce`.
- **Estado:** código entregue em 29/10/2026 e aprovado pelo usuário; confirmar
  que foi integrado e testado em produção. Documentação das alterações em
  `docs/alteracoes-visitante-exportacao-artigo.md`; diagramas, plano de teste e
  matriz ainda pendentes.

## Exportação de anotações em PDF

- **Origem:** sugestão do orientador ("exportar as anotações do usuário").
  Interpretada como baixar o diário em PDF (backup pessoal, ou levar a um
  psicólogo de fora da plataforma). Vale confirmar o uso com o orientador.
- **Só frontend, sem mudança no backend.** Usa as anotações que a tela já
  carregou (`AnotacoesContext`), monta uma área só para impressão e abre a
  janela de impressão do navegador, onde o usuário escolhe "Salvar como
  PDF". O texto do diário não passa por nenhum caminho novo no servidor.
- **Conteúdo do PDF:** mini cabeçalho "MindUp / Meu diário / Exportado em
  ... · N anotações"; por anotação: título, data, humor (emoji + nome) e
  texto. **Sem nome e sem e-mail.** Ordem **igual à da listagem** (mais
  recentes primeiro). A exportação da listagem leva o diário inteiro
  (ignora busca e filtro de humor).
- **Dois botões:** "Exportar anotações" na listagem (`Anotacoes.jsx`) e
  "Exportar esta anotação" na tela de leitura (`Ver_Anotacao.jsx`), pelo
  mesmo componente. Sem anotações, o botão da listagem fica desabilitado.
- **Aviso antes de gerar:** modal acessível dizendo que o arquivo é pessoal
  e orientando a escolher "Salvar como PDF".
- **Arquivos:** novos `pages/anotacoes/ExportarAnotacoes.jsx` e
  `pages/anotacoes/exportar-anotacoes.css`. O visual do PDF é Tailwind
  (variante `print:`); o CSS tem só 3 regras que o Tailwind não cobre
  sozinho (`@page`, esconder o app ao imprimir, tirar o degradê do body).
- **Limitações:** no iPhone a janela de impressão é mais desajeitada; PDF
  gerado com download direto (ex.: jsPDF) fica como evolução; o arquivo
  não tem senha e fica no dispositivo do usuário (por isso o aviso).
- **Estado:** código entregue e aprovado pelo usuário; o layout de impressão
  foi validado gerando um PDF de teste, mas o teste de ponta a ponta no app
  é do autor.

## Cortado/adiado intencionalmente (documentado em `docs/` no repo)

- **Mapa de consultórios (Mapbox/geolocalização)** — trabalho futuro.
  Decisão: só mostraria consultórios de psicólogos cadastrados no próprio
  MindUp (não farmácia/CAPS de terceiros, por responsabilidade com o tema).
  Campos de banco já existem no model `User` mas não estão em uso.
  Documento: `mapa-trabalhos-futuros.md`.
- **Rascunho / visibilidade de conteúdo ("ativo")**: campo `ativo` existe
  nas migrations/models/requests dos 4 tipos de conteúdo, mas **os
  Controllers nunca filtram por ele**. Decisão: removido o seletor do
  frontend em vez de implementar. Conferido no código de 29/10/2026: o selo
  "No Ar/Oculto" **não aparece mais** nas telas de listagem do painel (a
  antiga pendência foi resolvida).
  Documento: `rascunho-visibilidade-conteudo.md`.
- **Comentários nos conteúdos** (29/10/2026) — adiado: exigiria denúncia e
  moderação pelo administrador, um módulo próprio. Documento:
  `comentarios-trabalhos-futuros.md`.
- **Avaliação de conteúdos por nota 1–5 (cérebros)** (29/10/2026) — adiada:
  risco de pressão e disputa entre psicólogos e de afastar usuários de
  conteúdo útil. Documento: `avaliacoes-trabalhos-futuros.md`.

**Argumento central para a banca (comentários e avaliações):** o MindUp é
curadoria por psicólogos verificados, não rede social; conteúdo e influência
de usuários não verificados enfraqueceriam a garantia que a verificação de
psicólogos criou, e exigiriam governança (moderação, regras de exibição) que
é um módulo próprio. Escopo e segurança vêm primeiro; o prazo é citado por
último, com honestidade.

## Bugs relevantes já corrigidos (não reintroduzir)

- `bootstrap/app.php` tinha um alias de middleware que sequestrava
  `auth:sanctum`, quebrando toda autenticação da API.
- `FavoritoResource` retornava o conteúdo favoritado "cru" (sem passar
  pelo Resource certo), quebrando URLs de mídia e o campo `favoritado`.
- Case-sensitivity de pasta/arquivo (`Videos` vs `videos`) quebrava build no
  Netlify (funciona no Windows, quebra no Linux). Atenção: `header.jsx` e
  `footer.jsx` são minúsculos — importar com o mesmo caso.
- Escalonamento de privilégio no cadastro público (`is_admin`/`role`)
  corrigido na verificação de psicólogos.

## Armadilhas conhecidas (para não errar de novo)

- Os Resources dos conteúdos (`VideoResource` etc.) expõem o **e-mail do
  autor**. Nunca reutilizá-los em rota pública; criar formato próprio.
- `Layout`, `Header` e `BootstrapContext` dependem de login; telas públicas
  não devem usá-los.
- O `.env` do backend não deve ser compartilhado nem commitado.
- Arquivos de mídia ficam em URLs públicas do Cloudinary; limitar a 3
  itens no modo visitante é decisão de produto, não proteção de arquivo.
- **Não afirmar que o PDF dos artigos é "protegido contra download".** O
  `#toolbar=0` só esconde a barra em alguns leitores do PC e não impede o
  download. No Chrome do Android não há leitor de PDF embutido, então o
  arquivo é baixado em vez de aberto. A tela de artigo agora diz: "O PDF
  abrirá em uma nova aba ou será baixado, dependendo do seu aparelho."
  Leitor de PDF integrado (pdf.js) fica como trabalho futuro. Conferir o
  texto do TCC (requisitos, casos de uso, matriz) para não repetir a
  afirmação antiga.

## Documentos já produzidos para o TCC

Na pasta `docs/` do repo:
- `mapa-trabalhos-futuros.md` — ideia completa do mapa, para retomada.
- `rascunho-visibilidade-conteudo.md` — ideia da feature de rascunho.
- `problema-carregamento-inicial.md` — histórico do bug de concorrência.
- `comentarios-trabalhos-futuros.md` e `avaliacoes-trabalhos-futuros.md`
  — ideias adiadas, com justificativa e desenho para retomada.
- `alteracoes-visitante-exportacao-artigo.md` — documentação das alterações
  de 29/10/2026 (modo visitante, exportação de anotações, aviso do PDF),
  com regras RN16–RN28, plano de teste e impacto nos diagramas.

Outros:
- PDF "Verificação de psicólogos: documentação das alterações" (RN01–RN15).
- Matriz de rastreabilidade (PDF), mapa do site (PNG/SVG), diagrama de
  arquitetura (PNG/SVG com ícones das tecnologias), plano de teste
  (Excel, técnicas de Particionamento de Equivalência + Valor Limite).
- Diagramas de Casos de Uso e Classes revisados (Astah/UML, baseados no
  livro do Guedes) — correções já discutidas incluem generalização de
  atores (Psicólogo herda de Usuário) e ajustes de `<<extend>>`.

## Pendências de documentação (próximos passos)

- Atualizar diagramas de casos de uso e de classes: **Administrador** (já
  descrito no PDF da verificação), **Visitante** (ator separado, caso de uso
  "Visualizar Prévia de Conteúdos") e "Exportar Anotações" (`<<extend>>` do
  caso de uso de anotações). Não há classe nova persistente nas duas
  features novas. Detalhes em `docs/alteracoes-visitante-exportacao-artigo.md`.
- Plano de teste: modo visitante (valor limite com 0, 1, 2, 3 e 4 conteúdos
  por tipo) e exportação (0, 1 e várias anotações, humor vazio, acentos,
  texto longo, exportar duas vezes).
- Atualizar matriz de rastreabilidade e mapa do site (`/visitante`).
- Conferir no texto do TCC qualquer afirmação de "PDF protegido contra
  download" e removê-la.
- Testes automatizados ainda não cobrem a verificação de psicólogos, o modo
  visitante nem a exportação.
- Confirmar com o orientador o uso esperado da exportação de anotações.

## Como o usuário gosta de trabalhar (importante!)

- Prefere ir **uma coisa de cada vez**, confirmando antes de avançar.
- Pede pra eu opinar honestamente, não só validar ideias.
- Está com prazo apertado pro TCC — prioriza fechar funcionalidades
  simples/rápidas antes de features grandes novas, e documenta por que
  adiou o resto.
- Quer sempre que eu **leia o código real** (pede reenvio de zip) antes de
  afirmar algo com certeza, em vez de confiar só na memória da conversa.
- Valoriza que mudanças novas sejam **isoladas e reversíveis**, sem
  arriscar o que já funciona (autenticação, tela inicial).
- Quer manter o padrão de qualidade das telas existentes (responsividade e
  acessibilidade) nas telas novas, e prefere Tailwind (CSS próprio só
  quando o Tailwind não resolve).
- Prefere **honestidade na defesa do TCC**: não sustentar afirmações que
  não se sustentam (ex.: proteção contra download de PDF).
