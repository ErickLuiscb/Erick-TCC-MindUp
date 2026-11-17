import { administrador, pedido } from "../support/dados";

describe("Painel do admin: verificação de psicólogos", () => {
  const perfil = administrador();

  const pendenteA = pedido({
    id: 30,
    nome: "Ana Pendente",
    crp: "12345",
    crp_regiao: 7,
  });
  const pendenteB = pedido({
    id: 31,
    nome: "Bruno Pendente",
    crp: "22222",
    crp_regiao: 5,
  });
  const aprovada = pedido({
    id: 32,
    nome: "Carla Aprovada",
    crp: "33333",
    crp_regiao: 3,
    crp_status: "aprovado",
    cpf: null,
  });
  const rejeitado = pedido({
    id: 33,
    nome: "Davi Rejeitado",
    crp: "44444",
    crp_regiao: 4,
    crp_status: "rejeitado",
    crp_motivo: "Sem registro",
    cpf: null,
  });

  const abrirPainel = (
    itens = [pendenteA, pendenteB, aprovada, rejeitado],
    extra,
  ) =>
    cy.entrarComo(perfil, "/admin/psicologos", {
      antes: () => {
        cy.intercept("GET", "**/api/admin/psicologos", {
          body: {
            data: itens,
            contagens: {
              pendente: itens.filter((i) => i.crp_status === "pendente").length,
              aprovado: itens.filter((i) => i.crp_status === "aprovado").length,
              rejeitado: itens.filter((i) => i.crp_status === "rejeitado")
                .length,
            },
          },
        });
        if (extra) extra();
      },
    });

  const respostaStatus = (base, status, motivo = null) => ({
    statusCode: 200,
    body: {
      message: "ok",
      email_enviado: true,
      data: { ...base, crp_status: status, crp_motivo: motivo, cpf: null },
    },
  });

  it("mostra os pedidos pendentes com o CRP no formato região/número", () => {
    abrirPainel();

    cy.contains("Gerenciar Psicólogos").should("be.visible");
    cy.contains("Ana Pendente").should("be.visible");
    cy.contains("Bruno Pendente").should("be.visible");
    cy.contains("CRP 07/12345").should("be.visible");
    cy.contains("CRP 05/22222").should("be.visible");
    cy.contains("Carla Aprovada").should("not.exist");
  });

  it("a aba Psicólogos mostra os já decididos", () => {
    abrirPainel();

    cy.contains('[role="tab"]', "Psicólogos").click();

    cy.contains("Carla Aprovada").should("be.visible");
    cy.contains("Davi Rejeitado").should("be.visible");
    cy.contains("Ana Pendente").should("not.exist");
  });

  it("mostra a mensagem de vazio quando não há pedidos", () => {
    abrirPainel([aprovada]);

    cy.contains("Nenhum pedido pendente").should("be.visible");
  });

  it("busca por nome", () => {
    abrirPainel();

    cy.get('[aria-label="Buscar psicólogo"]').type("Bruno");

    cy.contains("Bruno Pendente").should("be.visible");
    cy.contains("Ana Pendente").should("not.exist");
  });

  it("aprova um pedido depois de confirmar", () => {
    abrirPainel(undefined, () =>
      cy
        .intercept(
          "PATCH",
          "**/api/admin/psicologos/30/status",
          respostaStatus(pendenteA, "aprovado"),
        )
        .as("status"),
    );
    cy.on("window:confirm", () => true);

    cy.get('[aria-label="Aprovar pedido de Ana Pendente"]').click();

    cy.wait("@status")
      .its("request.body")
      .should("deep.equal", { status: "aprovado" });
    cy.contains("Ana Pendente").should("not.exist"); // saiu da fila de pedidos
    cy.contains("Bruno Pendente").should("be.visible");
  });

  it("não aprova se o admin cancelar a confirmação", () => {
    abrirPainel(undefined, () =>
      cy.intercept("PATCH", "**/api/admin/psicologos/*/status").as("status"),
    );
    cy.on("window:confirm", () => false);

    cy.get('[aria-label="Aprovar pedido de Ana Pendente"]').click();

    cy.get("@status.all").should("have.length", 0);
    cy.contains("Ana Pendente").should("be.visible");
  });

  it("rejeitar exige um motivo e envia o motivo", () => {
    abrirPainel(undefined, () =>
      cy
        .intercept(
          "PATCH",
          "**/api/admin/psicologos/30/status",
          respostaStatus(pendenteA, "rejeitado", "CRP não encontrado."),
        )
        .as("status"),
    );

    cy.get('[aria-label="Rejeitar pedido de Ana Pendente"]').click();

    cy.get('[aria-label="Rejeitar solicitação"]').within(() => {
      cy.contains("button", "Rejeitar").should("be.disabled"); // sem motivo, não deixa
      cy.get("#motivo-admin").type("CRP não encontrado.");
      cy.contains("button", "Rejeitar").should("not.be.disabled").click();
    });

    cy.wait("@status").its("request.body").should("deep.equal", {
      status: "rejeitado",
      motivo: "CRP não encontrado.",
    });
    cy.contains("Ana Pendente").should("not.exist");
  });

  it("não aceita motivo só com espaços", () => {
    abrirPainel();

    cy.get('[aria-label="Rejeitar pedido de Ana Pendente"]').click();

    cy.get('[aria-label="Rejeitar solicitação"]').within(() => {
      cy.get("#motivo-admin").type("     ");
      cy.contains("button", "Rejeitar").should("be.disabled");
    });
  });

  it("revoga a permissão de um psicólogo aprovado, com motivo", () => {
    abrirPainel(undefined, () =>
      cy
        .intercept(
          "PATCH",
          "**/api/admin/psicologos/32/status",
          respostaStatus(aprovada, "rejeitado", "Registro suspenso."),
        )
        .as("status"),
    );
    cy.contains('[role="tab"]', "Psicólogos").click();

    cy.get('[aria-label="Revogar permissão de Carla Aprovada"]').click();

    cy.get('[aria-label="Revogar permissão de publicação"]').within(() => {
      cy.get("#motivo-admin").type("Registro suspenso.");
      cy.contains("button", "Revogar").click();
    });

    cy.wait("@status").its("request.body").should("deep.equal", {
      status: "rejeitado",
      motivo: "Registro suspenso.",
    });
  });

  it("reativa a permissão de um psicólogo rejeitado depois de confirmar", () => {
    abrirPainel(undefined, () =>
      cy
        .intercept(
          "PATCH",
          "**/api/admin/psicologos/33/status",
          respostaStatus(rejeitado, "aprovado"),
        )
        .as("status"),
    );
    cy.on("window:confirm", () => true);
    cy.contains('[role="tab"]', "Psicólogos").click();

    cy.get('[aria-label="Reativar permissão de Davi Rejeitado"]').click();

    cy.wait("@status")
      .its("request.body")
      .should("deep.equal", { status: "aprovado" });
  });
});
