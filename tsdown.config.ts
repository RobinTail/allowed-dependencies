import { defineConfig } from "tsdown";

export default defineConfig({
  fixedExtension: false,
  entry: "./src/index.ts",
  minify: true,
  deps: {
    neverBundle: true,
  },
  attw: { level: "error", profile: "esm-only" },
});
