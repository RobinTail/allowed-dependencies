import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";

import manifest from "./package.json" assert { type: "json" };

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
    files: ["*.ts"], // implies that "src" only contains the sources
    rules: {
      "allowed/dependencies": [
        "error",
        {
          manifest,
          typeOnly: ["typescript"],
        },
      ],
    },
  },
];
