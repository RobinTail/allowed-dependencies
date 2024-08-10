import semver from "semver";
import { defineConfig } from "tsup";
import { engines } from "./package.json";

const minNode = semver.minVersion(engines.node)!;

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
  minify: true,
  target: `node${minNode.major}.${minNode.minor}.${minNode.patch}`,
  cjsInterop: true,
  skipNodeModulesBundle: true,
});
