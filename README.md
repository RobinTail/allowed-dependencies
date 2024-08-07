# ESLint plugin Allowed Dependencies

ESLint plugin for restricting imports to package dependency categories.
Suggested to be used for source code, to prevent importing packages that are not present in the distribution.

The plugin distinguishes between production dependencies, mandatory and optional peers in your `package.json`.
The import syntax also matters: regular `import` or `import type` (excluded from distributable javascript code).

## Relationships and differences

- Unlike `@typescript-eslint/no-restricted-imports` rule, it allows you to configure what can be imported, and not what
  cannot, and not specifically, but by category.
- Unlike `no-extraneous-dependencies` of `eslint-plugin-import` plugin, it supports ESLint 9 and its flat config.
- Unlike same rule of `eslint-plugin-import-x` plugin, it does not require to install a typescript resolver to operate.

# Quick start

## Requirements

- `eslint@^9.0.0`
- `typescript-eslint@^8.0.0`

## Installation

```shell
yarn add --dev eslint-plugin-allowed-dependencies
```

## Setup

```javascript
// eslint.config.js
import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";
import { readFileSync } from "node:fs";

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
    files: ["src/**/*.ts"], // implies that "src" only contains the sources
    rules: {
      "allowed/dependencies": [
        "error",
        {
          // or just import it if supported by your enviornment:
          manifest: JSON.parse(readFileSync("./package.json", "utf8")),
          // these are defaults:
          /*
          production: true,
          requiredPeers: true,
          optionalPeers: "typeOnly",
          typeOnly: [],
           */
        },
      ],
    },
  },
];
```

# Configuration

## Options

| Option        | Type                | Default  | Description                                                     |
| ------------- | ------------------- | -------- | --------------------------------------------------------------- |
| **manifest**  | object              |          | your parsed package.json, required                              |
| production    | boolean or typeOnly | true     | allow importing ones in dependencies                            |
| requiredPeers | boolean or typeOnly | true     | allow importing non-optional ones in peerDependencies           |
| optionalPeers | boolean or typeOnly | typeOnly | allow importing ones marked as optional in peerDependenciesMeta |
| typeOnly      | string[]            | []       | extras to allow type only imports                               |
