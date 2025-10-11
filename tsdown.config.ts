import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  minify: true,
  skipNodeModulesBundle: true,
  attw: {
    level: "error",
    profile: "esmOnly",
  },
});
