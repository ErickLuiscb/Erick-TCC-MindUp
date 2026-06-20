import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev
export default defineConfig({
  build: {},
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "MindUp - Apoio ao Autocuidado Emocional",
        short_name: "MindUp",
        description:
          "Plataforma Digital para Apoio ao Autocuidado Emocional e Bem-Estar Mental",
        theme_color: "#5B6BBF",
        background_color: "#F3F4F6",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
