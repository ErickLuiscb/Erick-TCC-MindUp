// Comandos de apoio. A API é toda simulada com cy.intercept, então os testes
// rodam sem backend, sem banco e sem e-mail (por isso dá para testar até
// telas que dependem de confirmação de e-mail).

const BOOTSTRAP_VAZIO = {
  categorias: [],
  videos: [],
  artigos: [],
  sugestoes: [],
  autoajudas: [],
  favoritos: [],
};

// Tudo que não for simulado de forma específica responde "lista vazia".
// Regra do Cypress: o intercept definido por ÚLTIMO tem prioridade, então este
// vem sempre primeiro e os específicos de cada teste sobrescrevem.
Cypress.Commands.add("apiBase", () => {
  cy.intercept("**/api/**", { statusCode: 200, body: { data: [] } });
});

// Abre `rota` já logado como `perfil` (de support/dados.js).
//  - bootstrap: dados que /bootstrap devolve (videos, artigos, ...)
//  - antes: função para registrar intercepts extras ANTES da página carregar
Cypress.Commands.add(
  "entrarComo",
  (perfil, rota, { bootstrap = {}, antes } = {}) => {
    cy.apiBase();
    cy.intercept("GET", "**/api/me", {
      statusCode: 200,
      body: { data: perfil.usuario },
    });
    cy.intercept("GET", "**/api/bootstrap", {
      statusCode: 200,
      body: { ...BOOTSTRAP_VAZIO, ...bootstrap },
    });

    if (antes) antes();

    cy.visit(rota, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "token-de-teste");
        win.localStorage.setItem("usuario", JSON.stringify(perfil.usuario));
        win.localStorage.setItem("abilities", JSON.stringify(perfil.abilities));
      },
    });
  },
);
