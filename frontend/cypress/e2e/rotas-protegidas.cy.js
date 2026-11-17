import {
  usuarioComum,
  psicologoAprovado,
  psicologoPendente,
  administrador,
} from "../support/dados";

// Aqui o foco é quem entra em qual tela. (A proteção de verdade é do backend;
// o front só evita mostrar tela errada.)
describe("Rotas protegidas", () => {
  const painelAdmin = () =>
    cy.intercept("GET", "**/api/admin/psicologos", {
      body: { data: [], contagens: { pendente: 0, aprovado: 0, rejeitado: 0 } },
    });

  it("a raiz leva ao login", () => {
    cy.apiBase();
    cy.visit("/");

    cy.url().should("include", "/login");
  });

  const telasPrivadas = [
    "/inicial",
    "/videos",
    "/artigos",
    "/sugestoes",
    "/autoajuda",
    "/anotacoes",
    "/favoritos",
    "/perfil",
    "/dashboard",
    "/admin/psicologos",
  ];

  telasPrivadas.forEach((rota) => {
    it(`sem login, ${rota} manda para o login`, () => {
      cy.apiBase();
      cy.visit(rota);

      cy.url().should("include", "/login");
    });
  });

  it("usuário comum não entra no painel do profissional nem no de admin", () => {
    cy.entrarComo(usuarioComum(), "/dashboard");
    cy.url().should("include", "/inicial");

    cy.visit("/dashboard/videos", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("token", "t");
        win.localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioComum().usuario),
        );
        win.localStorage.setItem("abilities", "[]");
      },
    });
    cy.url().should("include", "/inicial");

    cy.visit("/admin/psicologos", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("token", "t");
        win.localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioComum().usuario),
        );
        win.localStorage.setItem("abilities", "[]");
      },
    });
    cy.url().should("include", "/inicial");
  });

  it("psicólogo pendente vê só o /dashboard; as telas de publicar voltam para ele", () => {
    cy.entrarComo(psicologoPendente(), "/dashboard");
    cy.url().should("match", /\/dashboard$/);

    cy.entrarComo(psicologoPendente(), "/dashboard/videos");
    cy.url().should("match", /\/dashboard$/);
  });

  it("psicólogo pendente não entra no painel de admin", () => {
    cy.entrarComo(psicologoPendente(), "/admin/psicologos");

    cy.url().should("include", "/inicial");
  });

  it("psicólogo aprovado entra nas telas de publicar, mas não no painel de admin", () => {
    cy.entrarComo(psicologoAprovado(), "/dashboard/videos");
    cy.url().should("include", "/dashboard/videos");

    cy.entrarComo(psicologoAprovado(), "/admin/psicologos");
    cy.url().should("include", "/inicial");
  });

  it("administrador entra no painel de admin", () => {
    cy.entrarComo(administrador(), "/admin/psicologos", { antes: painelAdmin });

    cy.url().should("include", "/admin/psicologos");
    cy.contains("Gerenciar Psicólogos").should("be.visible");
  });

  it("token recusado pelo servidor derruba a sessão", () => {
    cy.apiBase();
    cy.intercept("GET", "**/api/me", {
      statusCode: 401,
      body: { message: "Unauthenticated." },
    });

    cy.visit("/inicial", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("token", "token-vencido");
        win.localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioComum().usuario),
        );
        win.localStorage.setItem("abilities", "[]");
      },
    });

    cy.url().should("include", "/login");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "token")
      .should("be.null");
  });
});
