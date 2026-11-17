// Cadastro SEM e-mail de verdade: a API é simulada, então dá para testar o
// formulário e as mensagens sem depender da confirmação por e-mail.
describe("Cadastro", () => {
  const preencherBasico = ({
    senha = "segredo1",
    confirmar = "segredo1",
  } = {}) => {
    cy.get('input[name="nome"]').type("Maria Teste");
    cy.get('input[name="email"]').type("maria@teste.com");
    cy.get('input[name="senha"]').type(senha);
    cy.get('input[name="confirmar"]').type(confirmar);
  };

  const enviar = () => cy.contains("button", "FINALIZAR CADASTRO").click();

  beforeEach(() => {
    cy.apiBase();
    cy.intercept("POST", "**/api/register", {
      statusCode: 201,
      body: {
        message: "Cadastro realizado.",
        user: { id: 5, nome: "Maria Teste" },
      },
    }).as("registrar");
    cy.visit("/cadastro");
  });

  it("começa como usuário comum, sem campos de CRP e CPF", () => {
    cy.get('select[name="tipo"]').should("have.value", "usuario");
    cy.get('select[name="crp_regiao"]').should("not.exist");
    cy.get('input[name="crp"]').should("not.exist");
    cy.get('input[name="cpf"]').should("not.exist");
  });

  it("escolher Psicólogo mostra região, CRP e CPF; voltar para Usuário esconde", () => {
    cy.get('select[name="tipo"]').select("psicologo");

    cy.get('select[name="crp_regiao"]').should("be.visible");
    cy.get('input[name="crp"]').should("be.visible");
    cy.get('input[name="cpf"]').should("be.visible");

    cy.get('select[name="tipo"]').select("usuario");
    cy.get('input[name="cpf"]').should("not.exist");
  });

  it("a senha exige pelo menos 6 caracteres", () => {
    cy.get('input[name="senha"]').should("have.attr", "minlength", "6");
  });

  it("recusa senhas diferentes sem chamar a API", () => {
    preencherBasico({ confirmar: "diferente1" });

    enviar();

    cy.contains("As senhas não coincidem").should("be.visible");
    cy.get("@registrar.all").should("have.length", 0);
  });

  it("não envia o formulário vazio", () => {
    enviar();

    cy.get("@registrar.all").should("have.length", 0);
    cy.url().should("include", "/cadastro");
  });

  it("usuário comum: cadastra e avisa para confirmar o e-mail", () => {
    preencherBasico();

    enviar();

    cy.wait("@registrar")
      .its("request.headers.content-type")
      .should("include", "multipart/form-data");
    cy.contains("Enviamos um e-mail de confirmação").should("be.visible");
  });

  it("psicólogo: a região do CRP é obrigatória", () => {
    preencherBasico();
    cy.get('select[name="tipo"]').select("psicologo");
    cy.get('input[name="crp"]').type("12345");
    cy.get('input[name="cpf"]').type("52998224725");

    enviar();

    cy.get("@registrar.all").should("have.length", 0);
    cy.get('select[name="crp_regiao"]').then(($el) => {
      expect($el[0].checkValidity()).to.equal(false);
    });
  });

  it("psicólogo: recusa CPF inválido sem chamar a API", () => {
    preencherBasico();
    cy.get('select[name="tipo"]').select("psicologo");
    cy.get('select[name="crp_regiao"]').select(7);
    cy.get('input[name="crp"]').type("12345");
    cy.get('input[name="cpf"]').type("11111111111");

    enviar();

    cy.contains("CPF inválido").should("be.visible");
    cy.get("@registrar.all").should("have.length", 0);
  });

  it("psicólogo com dados válidos: cadastra e avisa para confirmar o e-mail", () => {
    preencherBasico();
    cy.get('select[name="tipo"]').select("psicologo");
    cy.get('select[name="crp_regiao"]').select(7);
    cy.get('input[name="crp"]').type("12345");
    cy.get('input[name="cpf"]').type("52998224725");

    enviar();

    cy.wait("@registrar");
    cy.contains("Enviamos um e-mail de confirmação").should("be.visible");
  });

  it("mostra a mensagem do servidor quando o cadastro é recusado", () => {
    cy.intercept("POST", "**/api/register", {
      statusCode: 422,
      body: { message: "O e-mail já está em uso." },
    }).as("recusado");
    preencherBasico();

    enviar();

    cy.wait("@recusado");
    cy.contains("O e-mail já está em uso.").should("be.visible");
  });
});
