import { defineConfig } from "tsdown";

export default defineConfig({
  format: "esm",
  entry: "./src/index.ts",
  sourcemap: false,
  clean: true,
  dts: true,
  minify: true,
  skipNodeModulesBundle: true,
  attw: {
    level: "error",
    profile: "esmOnly",
  },
});
