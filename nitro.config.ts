import { defineConfig } from "nitro";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  serverDir: "./server",
  alias: {
    "@domain": resolve(__dirname, "./src/domain"),
  },
});