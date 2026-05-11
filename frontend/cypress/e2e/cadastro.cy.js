describe("Cadastro de Usuário", () => {
  it("Deve cadastrar um novo usuário com sucesso", () => {
    // Gera email único para não repetir no banco
    const email = `teste_${Date.now()}@email.com`;

    cy.visit("http://localhost:5174/cadastro");

    // Preenche nome
    cy.get('input[name="nome"]').type("Usuário Teste Cypress");

    // Preenche email
    cy.get('input[name="email"]').type(email);

    // Preenche senha
    cy.get('input[name="senha"]').type("123456");

    // Confirma senha
    cy.get('input[name="confirmar"]').type("123456");

    // Tipo de conta (usuario)
    cy.get('select[name="tipo"]').select("usuario");

    // Submete formulário
    cy.contains("FINALIZAR CADASTRO").click();

    // Verifica mensagem de sucesso
    cy.contains("Cadastro realizado com sucesso").should("exist");

    // Verifica redirecionamento para login
    cy.url().should("include", "/login");
  });
});
