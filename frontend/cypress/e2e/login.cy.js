describe("Login de Usuário", () => {
  const usuario = {
    email: "teste_cypress@email.com",
    senha: "123456",
    nome: "Usuário Cypress"
  };

  before(() => {
    // Garante que o usuário existe (cria via cadastro se necessário)
    cy.visit("http://localhost:5174/cadastro");

    cy.get('input[name="nome"]').type(usuario.nome);
    cy.get('input[name="email"]').type(usuario.email);
    cy.get('input[name="senha"]').type(usuario.senha);
    cy.get('input[name="confirmar"]').type(usuario.senha);
    cy.get('select[name="tipo"]').select("usuario");

    cy.contains("FINALIZAR CADASTRO").click();
  });

  it("Deve fazer login com sucesso", () => {
    cy.visit("http://localhost:5174/login");

    cy.get('input[name="email"]').type(usuario.email);
    cy.get('input[name="senha"]').type(usuario.senha);

    cy.contains("ENTRAR").click();

    // Verifica redirecionamento
    cy.url().should("include", "/inicial");

    // Verifica se algo típico da área logada aparece
    cy.contains("Anotações").should("exist");
  });
});
