import {
  usuarioComum,
  video,
  artigo,
  autoajuda,
  autor,
} from "../support/dados";

// O backend só manda nome, foto e CRP do autor (nunca o e-mail).
// Aqui se confere que cada tela de detalhe mostra "Por <psicólogo>" e o CRP.
describe("Autor nas telas de conteúdo", () => {
  const perfil = usuarioComum();

  it("vídeo mostra o autor e o CRP no formato região/número", () => {
    cy.entrarComo(perfil, "/videos/1", { bootstrap: { videos: [video()] } });

    cy.contains("Por Dra. Ana Souza").should("be.visible");
    cy.contains("CRP: 07/12345").should("be.visible");
  });

  it("artigo mostra o autor e o CRP", () => {
    cy.entrarComo(perfil, "/artigos/1", { bootstrap: { artigos: [artigo()] } });

    cy.contains("Por Dra. Ana Souza").should("be.visible");
    cy.contains("CRP: 07/12345").should("be.visible");
  });

  it("autoajuda mostra o autor e o CRP", () => {
    cy.entrarComo(perfil, "/autoajuda/1", {
      bootstrap: { autoajudas: [autoajuda()] },
    });

    cy.contains("Por Dra. Ana Souza").should("be.visible");
    cy.contains("CRP: 07/12345").should("be.visible");
  });

  it("autor sem CRP cadastrado mostra o texto de reserva", () => {
    cy.entrarComo(perfil, "/videos/1", {
      bootstrap: { videos: [video({ autor: autor({ crp: null }) })] },
    });

    cy.contains("CRP: Verificado").should("be.visible");
  });

  it("conteúdo sem autor não quebra a tela", () => {
    cy.entrarComo(perfil, "/videos/1", {
      bootstrap: { videos: [video({ autor: null })] },
    });

    cy.contains("Por Profissional Cadastrado").should("be.visible");
    cy.contains("Respiração guiada").should("be.visible");
  });
});
