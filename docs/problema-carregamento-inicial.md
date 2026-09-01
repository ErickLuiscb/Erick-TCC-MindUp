# Problema: conteúdos/categorias sumindo no primeiro login

## O sintoma

Depois de fazer login, algumas telas (principalmente o filtro de categorias)
apareciam vazias. Um simples F5 resolvia na hora. O erro não era sempre no
mesmo lugar — às vezes eram as categorias, às vezes os vídeos, às vezes os
artigos.

## Por que acontecia (causa raiz)

O front-end (React) usa "Contexts" para guardar os dados de cada módulo:
`VideosContext`, `ArtigosContext`, `SugestoesContext`, cada um com seu
próprio `useEffect` que disparava uma chamada à API assim que o usuário
fazia login.

O problema: os três (na prática, quatro, contando Categorias) disparavam
suas chamadas **ao mesmo tempo**, exatamente no momento do login:

```
GET /videos
GET /artigos
GET /sugestoes
GET /categorias
```

Cada uma dessas ainda gera uma requisição extra de "preflight" (`OPTIONS`)
por causa do CORS (o navegador precisa perguntar "posso mandar essa
requisição?" antes de mandar de verdade, quando ela carrega um header
`Authorization`). Ou seja, na prática eram quase 8 requisições batendo no
servidor ao mesmo tempo.

O backend (Laravel, rodando via `php artisan serve` no Render) não é um
servidor de produção "de verdade" — por padrão ele processa uma
requisição por vez. Mesmo depois de ligarmos o suporte a múltiplos workers
(`PHP_CLI_SERVER_WORKERS`), a capacidade continua limitada, especialmente
no plano gratuito do Render. Com várias requisições concorrentes, algumas
acabavam demorando demais, falhando por timeout, ou chegando numa ordem
inesperada — e o código não tinha nenhum tratamento para "tentar de novo"
se isso acontecesse. O resultado: a tela ficava com a lista vazia até o
usuário atualizar a página manualmente (o que refazia tudo do zero e
geralmente dava certo, por sorte de timing).

## Tentativa inicial (paliativo)

A primeira correção foi adicionar um retry automático só no
`VideosContext` (2 tentativas, com um pequeno intervalo). Isso resolveu o
sintoma das categorias, mas era um remendo: a mesma lógica precisaria ser
copiada em `ArtigosContext`, `SugestoesContext`, e em cada módulo novo
que fosse criado (Autoajuda, Favoritos...). Não resolvia a causa —
continuava tendo várias requisições brigando pelo mesmo servidor limitado.

## Solução definitiva

Em vez de várias requisições concorrentes, criamos **uma única rota** no
backend, `GET /bootstrap`, que busca todos os dados internamente (dentro
do mesmo processo PHP, sem nenhuma concorrência entre eles) e devolve tudo
em um único JSON:

```json
{
  "categorias": [...],
  "videos": [...],
  "artigos": [...],
  "sugestoes": [...],
  "autoajudas": [...],
  "favoritos": [...]
}
```

No front-end, um novo `BootstrapContext` é o único responsável por chamar
essa rota no momento do login, e distribuir os dados recebidos para os
contexts que já existiam (`setVideos(...)`, `setArtigos(...)`, etc.) — sem
precisar alterar as telas que já usavam esses contexts.

Resultado prático:
- **1 requisição HTTP** no login, em vez de 4-5.
- Sem concorrência entre módulos — o gargalo do servidor deixou de ser um
  fator.
- Retry automático (2 tentativas) centralizado em um único lugar, em vez
  de duplicado em cada Context.
- Se mesmo assim falhar, aparece um aviso na tela com botão de
  "Tentar novamente", em vez de conteúdo sumindo silenciosamente.
- Módulos futuros (Autoajuda, Favoritos) já recebem seus dados prontos
  nessa mesma resposta, mesmo antes de terem uma tela própria — quando
  formos construí-las, a parte de "carregar os dados" já vai estar
  resolvida.

## Arquivos envolvidos

**Backend:**
- `app/Http/Controllers/api/BootstrapApiController.php` (novo)
- `routes/api.php` (nova rota `GET /bootstrap`)

**Frontend:**
- `src/context/BootstrapContext.jsx` (novo — orquestra o carregamento)
- `src/context/VideosContext.jsx`, `ArtigosContext.jsx`,
  `SugestoesContext.jsx` (removido o fetch automático individual de cada
  um; passaram a expor seus `setters` para o BootstrapContext preencher)
- `src/components/Layout.jsx` (aviso visual de erro + botão de retry
  manual)
- `src/App.jsx` (adicionado o `BootstrapProvider` na árvore de contexts)
