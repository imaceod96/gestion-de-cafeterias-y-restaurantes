import { defineConfig } from "nitro";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  serverDir: "./server",
  alias: {
    "@modules": resolve(__dirname, "./src/modules"),
    "@shared": resolve(__dirname, "./src/shared"),
    "@integrations": resolve(__dirname, "./src/integrations"),
    "@app": resolve(__dirname, "./src/app"),
  },
});