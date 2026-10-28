import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const COR_TEMA = "#3a0b6d"; // barra de status / barra de título do app instalado
const COR_FUNDO = "#2a0353"; // tela de abertura (splash): igual ao fundo do ícone

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "MindUp - Apoio ao Autocuidado Emocional",
        short_name: "MindUp",
        description:
          "Plataforma Digital para Apoio ao Autocuidado Emocional e Bem-Estar Mental",
        lang: "pt-BR",
        theme_color: COR_TEMA,
        background_color: COR_FUNDO,
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
