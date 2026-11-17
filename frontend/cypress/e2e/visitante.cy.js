import { usuarioComum, video, artigo } from "../support/dados";

describe("Modo visitante", () => {
  // O backend manda para o visitante conteúdos SEM autor
  const semAutor = (item) => ({ ...item, autor: undefined });

  const previa = {
    videos: [1, 2, 3].map((id) =>
      semAutor(video({ id, titulo: `Vídeo ${id}` })),
    ),
    artigos: [semAutor(artigo({ id: 1, titulo: "Guia do sono" }))],
    sugestoes: [],
    autoajudas: [],
  };

  beforeEach(() => {
    cy.apiBase();
    cy.intercept("GET", "**/api/visitante/conteudos", {
      body: { data: previa },
    }).as("previa");
  });

  it("mostra a prévia dos conteúdos sem precisar de login", () => {
    cy.visit("/visitante");

    cy.wait("@previa");
    cy.contains("Conheça o MindUp").should("be.visible");
    cy.contains("Vídeo 1").should("be.visible");
    cy.contains("Vídeo 3").should("be.visible");
    cy.contains("Guia do sono").should("be.visible");
  });

  it("não mostra psicólogo nenhum na prévia", () => {
    cy.visit("/visitante");

    cy.wait("@previa");
    cy.contains("Dra. Ana Souza").should("not.exist");
    cy.contains(/CRP/).should("not.exist");
  });

  it("clicar em um dos conteúdos da prévia abre o conteúdo", () => {
    cy.visit("/visitante");

    cy.contains("Vídeo 1").click();

    cy.get('[role="dialog"]').should("be.visible").and("contain", "Vídeo 1");
    cy.contains("Para conhecer mais, faça cadastro ou login").should(
      "not.exist",
    );
  });

  it("o botão de ver mais (com cadeado) pede cadastro ou login", () => {
    cy.visit("/visitante");

    cy.get('button[aria-haspopup="dialog"]').first().click();

    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Para conhecer mais, faça cadastro ou login").should(
      "be.visible",
    );
  });

  it("o aviso fecha com a tecla Esc", () => {
    cy.visit("/visitante");
    cy.get('button[aria-haspopup="dialog"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get("body").type("{esc}");

    cy.get('[role="dialog"]').should("not.exist");
  });

  it("o aviso fecha com o botão Agora não", () => {
    cy.visit("/visitante");
    cy.get('button[aria-haspopup="dialog"]').first().click();

    cy.contains("button", "Agora não").click();

    cy.get('[role="dialog"]').should("not.exist");
  });

  it("o aviso leva ao login", () => {
    cy.visit("/visitante");
    cy.get('button[aria-haspopup="dialog"]').first().click();

    cy.get('[role="dialog"]').contains("button", "Fazer login").click();

    cy.url().should("include", "/login");
  });

  it("o aviso leva ao cadastro", () => {
    cy.visit("/visitante");
    cy.get('button[aria-haspopup="dialog"]').first().click();

    cy.get('[role="dialog"]').contains("button", "Criar conta").click();

    cy.url().should("include", "/cadastro");
  });

  it("o botão Entrar do topo leva ao login", () => {
    cy.visit("/visitante");

    cy.get('[aria-label="Acesso à conta"]').contains("Entrar").click();

    cy.url().should("include", "/login");
  });

  it("quem já está logado é levado para a tela inicial", () => {
    cy.entrarComo(usuarioComum(), "/visitante");

    cy.url().should("include", "/inicial");
  });
});
