import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * - VITE_BASE_PATH — explicit override
 * - Vercel / Netlify — site at domain root → "/"
 * - GitHub Actions → same name as repo (…/github.io/<repo>/)
 * - Local / hearts360 copy → "/tool/"
 */
function resolveBaseUrl(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim();
  if (explicit) {
    const p = explicit.startsWith("/") ? explicit : `/${explicit}`;
    return p.endsWith("/") ? p : `${p}/`;
  }
  if (process.env.VERCEL || process.env.NETLIFY) return "/";
  if (
    process.env.GITHUB_ACTIONS === "true" &&
    process.env.GITHUB_REPOSITORY &&
    !process.env.VITE_FORCE_TOOL_BASE
  ) {
    const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
    if (repo) return `/${repo}/`;
  }
  return "/tool/";
}

const baseUrl = resolveBaseUrl();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // In dev, always serve from "/" so the Lovable preview (and plain `vite`) works.
  // The "/tool/" base only applies to production builds for the hearts360 copy.
  base: mode === "development" ? "/" : (baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`),
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
