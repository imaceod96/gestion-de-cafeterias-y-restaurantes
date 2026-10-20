import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nitro } from "nitro/vite";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react(), nitro()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@integrations": path.resolve(__dirname, "./src/integrations"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@server": path.resolve(__dirname, "./server"),
    },
  },
}));
