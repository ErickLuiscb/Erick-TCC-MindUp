describe("CRUD de Anotações", () => {
  beforeEach(() => {
    // 🔐 LOGIN
    cy.visit("/login");

    cy.get('input[name="email"]', { timeout: 15000 })
      .should("be.visible")
      .type("teste_cypress@email.com");

    cy.get('input[name="senha"]')
      .should("be.visible")
      .type("123456");

    cy.contains("ENTRAR", { timeout: 15000 }).click();

    // Aguarda ir para inicial
    cy.url({ timeout: 20000 }).should("include", "/inicial");
    cy.contains("Bem-vindo", { timeout: 15000 }).should("be.visible");
  });

  it("Cria, edita e exclui uma anotação", () => {
    // 📒 ENTRA EM ANOTAÇÕES
    cy.visit("/anotacoes");

    cy.contains("Minhas Anotações", { timeout: 15000 }).should("be.visible");
    cy.contains("+ Nova Anotação", { timeout: 15000 }).click();

    // ✍️ CRIAR ANOTAÇÃO
    cy.get('input', { timeout: 15000 })
      .first()
      .type("Anotação Cypress");

    cy.get("textarea")
      .type("Texto inicial da anotação criada pelo Cypress.");

    cy.contains("Salvar Anotação").click();

    // Volta para listagem
    cy.url({ timeout: 15000 }).should("include", "/anotacoes");
    cy.contains("Anotação Cypress", { timeout: 15000 }).should("be.visible");

    // ✏️ EDITAR ANOTAÇÃO
    cy.contains("Editar", { timeout: 15000 }).click();

    cy.get("textarea", { timeout: 15000 })
      .clear()
      .type("Texto editado pelo Cypress.");

    cy.contains("Salvar Alterações").click();

    cy.contains("Texto editado pelo Cypress.", { timeout: 15000 });

    // 🏠 VOLTAR PARA TELA INICIAL (CASINHA)
        cy.visit("/inicial");


    cy.url({ timeout: 15000 }).should("include", "/inicial");

    // 📒 ENTRA NOVAMENTE EM ANOTAÇÕES
    cy.visit("/anotacoes");
    cy.contains("Anotação Cypress", { timeout: 15000 }).should("be.visible");

    // 🗑️ DELETAR ANOTAÇÃO
    cy.contains("Excluir", { timeout: 15000 }).click();

    // Confirma o confirm()
    cy.on("window:confirm", () => true);

    // Verifica se foi removida
    cy.contains("Anotação Cypress").should("not.exist");
  });
});