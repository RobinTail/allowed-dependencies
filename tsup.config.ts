import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  minify: true,
  target: "node18.18.0",
  cjsInterop: true,
  skipNodeModulesBundle: true,
});
