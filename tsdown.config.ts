import { defineConfig } from "tsdown";

export default defineConfig({
  fixedExtension: false,
  entry: "./src/index.ts",
  minify: true,
  skipNodeModulesBundle: true,
  attw: { level: "error", profile: "esm-only" },
});
