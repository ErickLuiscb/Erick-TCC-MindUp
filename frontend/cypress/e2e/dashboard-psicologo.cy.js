import {
  psicologoAprovado,
  psicologoPendente,
  psicologoRejeitado,
} from "../support/dados";

describe("Painel do psicólogo: status da verificação", () => {
  it("pendente vê o aviso de que o cadastro está em análise", () => {
    cy.entrarComo(psicologoPendente(), "/dashboard");

    cy.contains("Seu cadastro está em análise").should("be.visible");
    cy.contains("Seu cadastro profissional não foi aprovado").should(
      "not.exist",
    );
  });

  it("rejeitado vê o aviso e o motivo informado pelo admin", () => {
    cy.entrarComo(psicologoRejeitado("Registro não localizado."), "/dashboard");

    cy.contains("Seu cadastro profissional não foi aprovado").should(
      "be.visible",
    );
    cy.contains("Motivo:").should("be.visible");
    cy.contains("Registro não localizado.").should("be.visible");
  });

  it("aprovado vê o painel completo, sem avisos de análise", () => {
    cy.entrarComo(psicologoAprovado(), "/dashboard");

    cy.contains("Painel do Profissional").should("be.visible");
    cy.contains("Dra. Ana Souza").should("be.visible");
    cy.contains("Seu cadastro está em análise").should("not.exist");
    cy.contains("Seu cadastro profissional não foi aprovado").should(
      "not.exist",
    );
  });
});
