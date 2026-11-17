import { usuarioComum, video, artigo } from "../support/dados";

describe("Favoritar conteúdos", () => {
  const perfil = usuarioComum();

  const interceptarFavoritar = (status = 201, body = { favoritado: true }) =>
    cy
      .intercept("POST", "**/api/favoritos", { statusCode: status, body })
      .as("favoritar");

  context("na listagem de vídeos", () => {
    it("favorita e desfavorita pelo coração do card", () => {
      cy.entrarComo(perfil, "/videos", {
        bootstrap: { videos: [video()] },
        antes: () => interceptarFavoritar(),
      });

      cy.get('[aria-label="Adicionar aos favoritos"]').click();
      cy.wait("@favoritar")
        .its("request.body")
        .should("deep.include", { tipo: "video", favoritavel_id: 1 });
      cy.get('[aria-label="Remover dos favoritos"]').should(
        "have.attr",
        "aria-pressed",
        "true",
      );

      cy.get('[aria-label="Remover dos favoritos"]').click();
      cy.wait("@favoritar");
      cy.get('[aria-label="Adicionar aos favoritos"]').should(
        "have.attr",
        "aria-pressed",
        "false",
      );
    });

    it("se o servidor falhar, o coração volta ao estado anterior", () => {
      cy.entrarComo(perfil, "/videos", {
        bootstrap: { videos: [video()] },
        antes: () => interceptarFavoritar(500, { message: "Erro" }),
      });

      cy.get('[aria-label="Adicionar aos favoritos"]').click();
      cy.wait("@favoritar");

      cy.get('[aria-label="Adicionar aos favoritos"]').should("exist");
      cy.get('[aria-label="Remover dos favoritos"]').should("not.exist");
    });
  });

  context("na tela do vídeo", () => {
    it("tem o botão de favoritar e alterna entre Favoritar e Salvo nos Favoritos", () => {
      cy.entrarComo(perfil, "/videos/1", {
        bootstrap: { videos: [video()] },
        antes: () => interceptarFavoritar(),
      });

      cy.contains("button", "Favoritar")
        .should("have.attr", "aria-pressed", "false")
        .click();
      cy.wait("@favoritar")
        .its("request.body")
        .should("deep.include", { tipo: "video", favoritavel_id: 1 });
      cy.contains("button", "Salvo nos Favoritos").should(
        "have.attr",
        "aria-pressed",
        "true",
      );

      cy.contains("button", "Salvo nos Favoritos").click();
      cy.wait("@favoritar");
      cy.contains("button", "Favoritar").should("exist");
    });

    it("um vídeo já favoritado já abre como salvo", () => {
      cy.entrarComo(perfil, "/videos/1", {
        bootstrap: { videos: [video({ favoritado: true })] },
      });

      cy.contains("button", "Salvo nos Favoritos").should("be.visible");
    });

    it("mantém o botão Fechar Player funcionando", () => {
      cy.entrarComo(perfil, "/videos/1", { bootstrap: { videos: [video()] } });

      cy.contains("a", "Fechar Player").click();

      cy.url().should("match", /\/videos$/);
    });
  });

  context("na tela do artigo", () => {
    it("tem o botão de favoritar ao lado de Ler Artigo Completo", () => {
      cy.entrarComo(perfil, "/artigos/1", {
        bootstrap: { artigos: [artigo()] },
        antes: () => interceptarFavoritar(),
      });

      cy.contains("button", "Ler Artigo Completo").should("be.visible");

      cy.contains("button", "Favoritar").click();
      cy.wait("@favoritar")
        .its("request.body")
        .should("deep.include", { tipo: "artigo", favoritavel_id: 1 });
      cy.contains("button", "Salvo nos Favoritos").should(
        "have.attr",
        "aria-pressed",
        "true",
      );
    });
  });
});
