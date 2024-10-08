import jsPlugin from "@eslint/js";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";
import tsPlugin from "typescript-eslint";

export default [
  {
    plugins: {
      allowed: allowedDepsPlugin,
    },
  },
  jsPlugin.configs.recommended,
  ...tsPlugin.configs.recommended,
  // For the sources:
  {
    files: ["src/*.ts"],
    rules: {
      "allowed/dependencies": ["error", { typeOnly: ["typescript"] }],
    },
  },
];
