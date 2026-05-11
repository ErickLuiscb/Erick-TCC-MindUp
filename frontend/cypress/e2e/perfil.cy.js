describe("Perfil do Usuário", () => {

  beforeEach(() => {
    // Login reutilizando o fluxo real
    cy.visit("/login");

    cy.get('input[name="email"]', { timeout: 15000 })
      .type("teste_cypress@email.com");

    cy.get('input[name="senha"]')
      .type("123456");

    cy.contains("ENTRAR", { timeout: 15000 }).click();

    // Garante que chegou na tela inicial
    cy.url({ timeout: 15000 }).should("include", "/inicial");
  });

  it("Edita perfil e exclui a conta com sucesso", () => {
    // ===== PERFIL =====
    cy.visit("/perfil");

    cy.get('[data-cy="perfil-imagem"]', { timeout: 15000 })
      .should("be.visible");

    // ===== EDITAR PERFIL =====
    cy.get('[data-cy="btn-editar-perfil"]').click();

    cy.url().should("include", "/perfil/editar");

    cy.get('[data-cy="perfil-nome"]')
      .clear()
      .type("Usuário Cypress Editado");

    cy.get('[data-cy="perfil-upload-imagem"]')
      .selectFile("cypress/fixtures/avatar.jpg", { force: true });

    cy.get('[data-cy="perfil-salvar"]').click();

    cy.url({ timeout: 15000 }).should("include", "/perfil");

    cy.contains("Usuário Cypress Editado", { timeout: 15000 })
      .should("exist");

    // ===== EXCLUIR CONTA =====
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });

    cy.get('[data-cy="btn-excluir-conta"]')
      .should("be.visible")
      .click();

    // ===== REDIRECIONA PARA LOGIN =====
    cy.url({ timeout: 15000 }).should("include", "/login");
  });
});
