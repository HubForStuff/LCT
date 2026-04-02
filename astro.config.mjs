import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import keystatic from "@keystatic/astro";

const keystaticEnabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_KEYSTATIC === "true";

export default defineConfig({
  site: "https://bruehstdio.github.io",
  base: "/",
  integrations: [mdx(), tailwind(), ...(keystaticEnabled ? [keystatic()] : [])],
  output: "static",
  outDir: "./dist",
  devToolbar: {
    enabled: false,
  },
});
