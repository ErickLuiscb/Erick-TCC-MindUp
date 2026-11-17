import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Porta em que o `npm run dev` está rodando. Para outra porta, sem editar
    // este arquivo:  CYPRESS_baseUrl=http://localhost:5173 npx cypress run
    baseUrl: "http://localhost:5174",
    // Como a API é simulada (cy.intercept), nada aqui depende do Render/Supabase.
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 20000,
    requestTimeout: 8000,
    video: false,
    // Desktop: o menu completo (Sair, Admin...) só aparece a partir de 1024px
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
