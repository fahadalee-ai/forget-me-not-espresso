import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Hard-pin Vercel outside Lovable builds. Lovable still applies its own preset.
  nitro: { preset: "vercel" },
  vite: {
    base: "/",
    server: {
      allowedHosts: ["localhost", "127.0.0.1", ".vercel.app", "demo.sourapps.com"],
    },
    preview: {
      allowedHosts: ["localhost", "127.0.0.1", ".vercel.app", "demo.sourapps.com"],
    },
  },
});