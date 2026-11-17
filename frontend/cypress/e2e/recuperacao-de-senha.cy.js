describe("Recuperação de senha e confirmação de e-mail", () => {
  beforeEach(() => {
    cy.apiBase();
  });

  context("esqueci minha senha", () => {
    it("envia o e-mail informado e mostra uma resposta", () => {
      cy.intercept("POST", "**/api/forgot-password", {
        statusCode: 200,
        body: {
          message: "Se o e-mail estiver cadastrado, você receberá o link.",
        },
      }).as("esqueci");
      cy.visit("/esqueci-senha");

      cy.get("#esqueci-email").type("ana@teste.com");
      cy.contains("button", "ENVIAR LINK DE REDEFINIÇÃO").click();

      cy.wait("@esqueci")
        .its("request.body")
        .should("deep.equal", { email: "ana@teste.com" });
      cy.get('[role="status"]').should("not.be.empty");
    });

    it("não envia sem e-mail", () => {
      cy.intercept("POST", "**/api/forgot-password").as("esqueci");
      cy.visit("/esqueci-senha");

      cy.contains("button", "ENVIAR LINK DE REDEFINIÇÃO").click();

      cy.get("@esqueci.all").should("have.length", 0);
    });

    it("volta para o login", () => {
      cy.visit("/esqueci-senha");

      cy.contains("Voltar para o login").click();

      cy.url().should("include", "/login");
    });
  });

  context("nova senha (link recebido por e-mail)", () => {
    const link = "/redefinir-senha?token=abc123&email=ana@teste.com";

    it("link sem token é tratado como inválido", () => {
      cy.visit("/redefinir-senha");

      cy.contains(
        "Este link de redefinição está incompleto ou inválido",
      ).should("be.visible");
    });

    it("recusa senhas diferentes sem chamar a API", () => {
      cy.intercept("POST", "**/api/reset-password").as("redefinir");
      cy.visit(link);

      cy.get("#redefinir-senha").type("novaSenha1");
      cy.get("#redefinir-confirmacao").type("outraSenha2");
      cy.contains("button", "REDEFINIR SENHA").click();

      cy.contains("As senhas não coincidem").should("be.visible");
      cy.get("@redefinir.all").should("have.length", 0);
    });

    it("envia token, e-mail e a nova senha", () => {
      cy.intercept("POST", "**/api/reset-password", {
        statusCode: 200,
        body: { message: "Senha redefinida com sucesso." },
      }).as("redefinir");
      cy.visit(link);

      cy.get("#redefinir-senha").type("novaSenha1");
      cy.get("#redefinir-confirmacao").type("novaSenha1");
      cy.contains("button", "REDEFINIR SENHA").click();

      cy.wait("@redefinir").its("request.body").should("deep.include", {
        token: "abc123",
        email: "ana@teste.com",
        senha: "novaSenha1",
      });
    });

    it("link expirado mostra o erro", () => {
      cy.intercept("POST", "**/api/reset-password", {
        statusCode: 422,
        body: { message: "O link de redefinição expirou. Peça um novo." },
      }).as("redefinir");
      cy.visit(link);

      cy.get("#redefinir-senha").type("novaSenha1");
      cy.get("#redefinir-confirmacao").type("novaSenha1");
      cy.contains("button", "REDEFINIR SENHA").click();

      cy.wait("@redefinir");
      cy.contains(/expir/i).should("be.visible");
    });
  });

  context("e-mail verificado (destino do link enviado no cadastro)", () => {
    it("sucesso: conta ativada e botão para o login", () => {
      cy.visit("/email-verificado?status=sucesso");

      cy.contains("Sua conta foi ativada com sucesso").should("be.visible");
      cy.contains("Ir para o login").click();

      cy.url().should("include", "/login");
    });

    it("erro: não diz que a conta foi ativada", () => {
      cy.visit("/email-verificado?status=erro");

      cy.contains("Sua conta foi ativada com sucesso").should("not.exist");
      cy.get("h1").should("be.visible");
    });

    it("sem status também não diz que a conta foi ativada", () => {
      cy.visit("/email-verificado");

      cy.contains("Sua conta foi ativada com sucesso").should("not.exist");
    });
  });
});
