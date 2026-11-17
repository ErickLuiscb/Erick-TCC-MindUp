import {
  usuarioComum,
  administrador,
  psicologoAprovado,
} from "../support/dados";

describe("Login", () => {
  const entrar = (email = "ana@teste.com", senha = "123456") => {
    cy.get("#login-email").type(email);
    cy.get("#login-senha").type(senha);
    cy.contains("button", "ENTRAR").click();
  };

  beforeEach(() => {
    cy.apiBase();
  });

  it("mostra o formulário de login", () => {
    cy.visit("/login");

    cy.get("#login-email").should("be.visible");
    cy.get("#login-senha").should("be.visible");
    cy.contains("button", "ENTRAR").should("be.visible");
  });

  it("remove espaços digitados na senha", () => {
    cy.visit("/login");

    cy.get("#login-senha").type("abc 123").should("have.value", "abc123");
  });

  it("mostra e esconde a senha", () => {
    cy.visit("/login");

    cy.get("#login-senha").should("have.attr", "type", "password");
    cy.get('[aria-label="Mostrar senha"]').click();
    cy.get("#login-senha").should("have.attr", "type", "text");
    cy.get('[aria-label="Ocultar senha"]').click();
    cy.get("#login-senha").should("have.attr", "type", "password");
  });

  it("não envia o formulário vazio", () => {
    cy.intercept("POST", "**/api/login").as("login");
    cy.visit("/login");

    cy.contains("button", "ENTRAR").click();

    cy.get("@login.all").should("have.length", 0);
    cy.url().should("include", "/login");
  });

  it("mostra o erro quando e-mail ou senha estão errados", () => {
    cy.intercept("POST", "**/api/login", {
      statusCode: 401,
      body: { message: "E-mail ou senha incorretos" },
    }).as("login");
    cy.visit("/login");

    entrar("ana@teste.com", "senha-errada");

    cy.wait("@login")
      .its("request.body")
      .should("deep.equal", { email: "ana@teste.com", senha: "senha-errada" });
    cy.get('[role="alert"]').should("contain", "E-mail ou senha incorretos");
    cy.url().should("include", "/login");
  });

  it("e-mail não confirmado: avisa e oferece reenviar o e-mail de confirmação", () => {
    cy.intercept("POST", "**/api/login", {
      statusCode: 403,
      body: {
        message: "Confirme seu e-mail para entrar.",
        email_nao_verificado: true,
      },
    });
    cy.intercept("POST", "**/api/email/reenviar", {
      statusCode: 200,
      body: {
        message: "Se o e-mail estiver cadastrado, enviaremos um novo link.",
      },
    }).as("reenviar");
    cy.visit("/login");

    entrar();
    cy.contains("Confirme seu e-mail para entrar.").should("be.visible");

    cy.contains("button", "Reenviar e-mail de confirmação").click();
    cy.wait("@reenviar")
      .its("request.body")
      .should("deep.equal", { email: "ana@teste.com" });
    cy.contains("Se o e-mail estiver cadastrado").should("be.visible");
  });

  it("usuário comum entra e cai na tela inicial, sem links de psicólogo nem de admin", () => {
    const perfil = usuarioComum();
    cy.intercept("POST", "**/api/login", {
      statusCode: 200,
      body: {
        message: "ok",
        token: "t",
        abilities: perfil.abilities,
        user: perfil.usuario,
      },
    });
    cy.intercept("GET", "**/api/me", { body: { data: perfil.usuario } });
    cy.intercept("GET", "**/api/bootstrap", {
      body: {
        categorias: [],
        videos: [],
        artigos: [],
        sugestoes: [],
        autoajudas: [],
        favoritos: [],
      },
    });
    cy.visit("/login");

    entrar();

    cy.url().should("include", "/inicial");
    cy.contains("Olá, Ana Teste").should("be.visible");
    cy.contains("Meu Painel").should("not.exist");
    cy.contains("Admin").should("not.exist");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "token")
      .should("eq", "t");
  });

  it("psicólogo aprovado enxerga o link do painel", () => {
    cy.entrarComo(psicologoAprovado(), "/inicial");

    cy.contains("Meu Painel").should("exist");
  });

  it("administrador enxerga o link de admin", () => {
    cy.entrarComo(administrador(), "/inicial");

    cy.contains("Admin").should("exist");
  });

  it("quem já está logado não vê a tela de login", () => {
    cy.entrarComo(usuarioComum(), "/login");

    cy.url().should("include", "/inicial");
  });

  it("sair encerra a sessão e volta para o login", () => {
    cy.intercept("POST", "**/api/logout", {
      statusCode: 200,
      body: { message: "ok" },
    });
    // o menu completo (com o Sair) só aparece a partir de 1024px de largura
    cy.viewport(1280, 720);
    cy.entrarComo(usuarioComum(), "/inicial");

    cy.contains("button:visible", "Sair").click();

    cy.url().should("include", "/login");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "token")
      .should("be.null");
  });

  it("leva ao modo visitante e à recuperação de senha", () => {
    cy.visit("/login");
    cy.contains("button", /visitante/i).click();
    cy.url().should("include", "/visitante");

    cy.visit("/login");
    cy.contains("button", "Esqueceu a senha?").click();
    cy.url().should("include", "/esqueci-senha");
  });
});
