import { usuarioComum, anotacao } from "../support/dados";

describe("Diário (anotações)", () => {
  const perfil = usuarioComum();

  const lista = [
    anotacao({ id: 1, titulo: "Dia calmo", humor: "calmo" }),
    anotacao({ id: 2, titulo: "Prova de redes", humor: "ansioso" }),
  ];

  const comLista =
    (itens = lista) =>
    () =>
      cy.intercept("GET", "**/api/anotacoes", { body: { data: itens } });

  it("lista as anotações do usuário", () => {
    cy.entrarComo(perfil, "/anotacoes", { antes: comLista() });

    cy.contains("Meu Diário Pessoal").should("be.visible");
    cy.get('[aria-label="Visualizar anotação: Dia calmo"]').should("exist");
    cy.get('[aria-label="Visualizar anotação: Prova de redes"]').should(
      "exist",
    );
  });

  it("mostra a mensagem de vazio quando não há anotações", () => {
    cy.entrarComo(perfil, "/anotacoes", { antes: comLista([]) });

    cy.contains("Seu diário está em branco").should("be.visible");
    cy.contains("Criar minha primeira nota").should("be.visible");
  });

  it("busca anotações pelo título", () => {
    cy.entrarComo(perfil, "/anotacoes", { antes: comLista() });

    cy.get('[aria-label="Buscar anotações por título"]').type("redes");

    cy.get('[aria-label="Visualizar anotação: Prova de redes"]').should(
      "exist",
    );
    cy.get('[aria-label="Visualizar anotação: Dia calmo"]').should("not.exist");
  });

  it("busca sem resultado mostra a mensagem de que nada combina", () => {
    cy.entrarComo(perfil, "/anotacoes", { antes: comLista() });

    cy.get('[aria-label="Buscar anotações por título"]').type("zzzz");

    cy.contains("Nenhuma anotação encontrada").should("be.visible");
    cy.contains("Nenhuma anotação combina com a busca").should("be.visible");
    cy.contains("Seu diário está em branco").should("not.exist");
  });

  it("cria uma anotação com humor e volta para a lista", () => {
    cy.entrarComo(perfil, "/anotacoes/criar", {
      antes: () => {
        comLista([])();
        cy.intercept("POST", "**/api/anotacoes", {
          statusCode: 201,
          body: {
            data: anotacao({
              id: 3,
              titulo: "Meu dia",
              texto: "Foi bom.",
              humor: "feliz",
            }),
          },
        }).as("criar");
      },
    });

    cy.get("#titulo-anotacao").type("Meu dia");
    cy.get('[role="group"]').contains(/feliz/i).click();
    cy.get('[role="group"] button[aria-pressed="true"]').should(
      "have.length",
      1,
    );
    cy.get("#texto-anotacao").type("Foi bom.");
    cy.contains("button", "Salvar Registro").click();

    cy.wait("@criar").its("request.body").should("deep.equal", {
      titulo: "Meu dia",
      texto: "Foi bom.",
      humor: "feliz",
    });
    cy.url().should("match", /\/anotacoes$/);
  });

  it("não envia anotação sem título e sem texto", () => {
    cy.entrarComo(perfil, "/anotacoes/criar", {
      antes: () => cy.intercept("POST", "**/api/anotacoes").as("criar"),
    });

    cy.contains("button", "Salvar Registro").click();

    cy.get("@criar.all").should("have.length", 0);
    cy.url().should("include", "/anotacoes/criar");
  });

  it("limita o título a 100 caracteres", () => {
    cy.entrarComo(perfil, "/anotacoes/criar");

    cy.get("#titulo-anotacao").should("have.attr", "maxlength", "100");
  });

  it("abre a edição já com o conteúdo da anotação", () => {
    cy.entrarComo(perfil, "/anotacoes", { antes: comLista() });

    cy.get('[aria-label="Editar anotação: Dia calmo"]').click();

    cy.url().should("include", "/anotacoes/editar/1");
    cy.get("#titulo-anotacao").should("have.value", "Dia calmo");
    cy.get("#texto-anotacao").should("have.value", "Foi tranquilo.");
  });

  it("exclui a anotação depois de confirmar", () => {
    cy.entrarComo(perfil, "/anotacoes", {
      antes: () => {
        comLista()();
        cy.intercept("DELETE", "**/api/anotacoes/1", {
          statusCode: 200,
          body: { message: "ok" },
        }).as("apagar");
      },
    });
    cy.on("window:confirm", () => true);

    cy.get('[aria-label="Apagar anotação: Dia calmo"]').click();

    cy.wait("@apagar");
    cy.get('[aria-label="Visualizar anotação: Dia calmo"]').should("not.exist");
    cy.get('[aria-label="Visualizar anotação: Prova de redes"]').should(
      "exist",
    );
  });

  it("não exclui se o usuário cancelar a confirmação", () => {
    cy.entrarComo(perfil, "/anotacoes", {
      antes: () => {
        comLista()();
        cy.intercept("DELETE", "**/api/anotacoes/*").as("apagar");
      },
    });
    cy.on("window:confirm", () => false);

    cy.get('[aria-label="Apagar anotação: Dia calmo"]').click();

    cy.get("@apagar.all").should("have.length", 0);
    cy.get('[aria-label="Visualizar anotação: Dia calmo"]').should("exist");
  });
});
