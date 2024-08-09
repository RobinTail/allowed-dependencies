import type { TSESLint } from "@typescript-eslint/utils";
import { rule } from "./rule.ts";

export default {
  rules: { dependencies: rule },
} satisfies TSESLint.Linter.Plugin;
