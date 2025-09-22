import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      port: 3001,
    },
  },
  build: {
    assetsInlineLimit: 0,
  },
});