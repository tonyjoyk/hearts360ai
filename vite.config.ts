import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// "/" on Vercel/Netlify (shareable previews); "/tool/" for copying into hearts360.org static tree
const baseUrl =
  process.env.VITE_BASE_PATH ??
  (process.env.VERCEL || process.env.NETLIFY ? "/" : "/tool/");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
