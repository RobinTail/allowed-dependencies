import type { TSESLint } from "@typescript-eslint/utils";
import { rule } from "./rule";

export default {
  rules: { dependencies: rule },
} satisfies TSESLint.Linter.Plugin;
