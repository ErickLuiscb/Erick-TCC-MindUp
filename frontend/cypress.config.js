import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5174",
    defaultCommandTimeout: 15000,   // 👈 AQUI
    pageLoadTimeout: 20000,
    requestTimeout: 20000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
