import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        oralHistory: fileURLToPath(new URL("./oral-history/index.html", import.meta.url)),
        share: fileURLToPath(new URL("./share/index.html", import.meta.url)),
      },
    },
  },
});
