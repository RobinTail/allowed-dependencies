# ESLint plugin Allowed Dependencies

[![Coverage Status](https://coveralls.io/repos/github/RobinTail/allowed-dependencies/badge.svg)](https://coveralls.io/github/RobinTail/allowed-dependencies)
![License](https://img.shields.io/npm/l/eslint-plugin-allowed-dependencies.svg?color=green25)
![npm release](https://img.shields.io/npm/v/eslint-plugin-allowed-dependencies.svg?color=green25&label=latest)
![downloads](https://img.shields.io/npm/dw/eslint-plugin-allowed-dependencies.svg)

ESLint plugin for restricting imports to package dependency categories.
Suggested to be used for source code, to prevent importing packages that are not present in the distribution.

The plugin distinguishes between production dependencies, mandatory and optional peers in your `package.json`.
The import syntax also matters: regular `import` or `import type` (excluded from distributable javascript code).

## Demo

```jsonc
// package.json
{
  "dependencies": { "express-zod-api": "^20" },
  "devDependencies": { "typescript": "^5" },
  "peerDependencies": { "prettier": "^3" },
  "peerDependenciesMeta": { "prettier": { "optional": true } },
}
```

```typescript
// src/index.ts
import { createServer } from "express-zod-api"; // OK
import { join } from "node:fs"; // OK
import { helper } from "./tools"; // OK
import { factory } from "typescript"; // Error: Only 'import type' syntax is allowed for typescript.
import { format } from "prettier"; // Error: Only 'import type' syntax is allowed for prettier.
import fancyFn from "unlisted-module"; // Error: Importing unlisted-module is not allowed.
```

## Relationships and differences

- Unlike `@typescript-eslint/no-restricted-imports` rule, it allows you to configure what can be imported, and not what
  cannot, and not specifically, but by category.
- Unlike `no-extraneous-dependencies` of `eslint-plugin-import` plugin, it supports ESLint 9 and its flat config.
- Unlike same rule of `eslint-plugin-import-x` plugin, it does not require to install a typescript resolver to operate.
- The plugin also supports reading multiple `package.json`.

# Quick start

## Requirements

- Node.js `^18.18.0 || ^20.9.0 || ^22.0.0 || ^24.0.0`
- `eslint@^9.0.0`
- `typescript-eslint@^8.0.0`

## Installation

```shell
yarn add --dev eslint-plugin-allowed-dependencies
```

## Setup

```javascript
// eslint.config.js or .mjs if you're developing in CommonJS environment
import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";

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
      "allowed/dependencies": "error",
    },
  },
  // In case "src" also contains tests:
  // {
  //  files: ["src/**/*.spec.ts"], // exclude test files
  //  rules: { "allowed/dependencies": "off" },
  // },
];
```

# Configuration

## Options

Supply the options this way:

```json5
{
  rules: {
    "allowed/dependencies": [
      "error", // these are defaults:
      {
        packageDir: ".",
        production: true,
        requiredPeers: true,
        optionalPeers: "typeOnly",
        development: "typeOnly",
        typeOnly: [],
        ignore: ["^\\.", "^node:"],
      },
      // {...} — you can add more (workspaces?)
    ],
  },
}
```

By default, the plugin is configured for checking the source code based on the `package.json` located in the current
working directory of the ESLint process. Production dependencies and mandatory peers are allowed to import,
but optional peers and development modules are allowed to be imported only as types.

```yaml
packageDir:
  description: The path having your package.json
  type: string
  default: ctx.cwd # ESLint process.cwd()

production:
  description: Allow importing the packages listed in manifest.dependencies
  type:
    - boolean
    - "typeOnly"
  default: true

requiredPeers:
  description: Allow importing the non-optional packages listed in manifest.peerDependencies
  type:
    - boolean
    - "typeOnly"
  default: true

optionalPeers:
  description: Allow importing the packages marked as optional in manifest.peerDependenciesMeta
  type:
    - boolean
    - "typeOnly"
  default: "typeOnly"

development:
  description: Allow importing the packages listed in manifest.devDependencies
  type:
    - boolean
    - "typeOnly"
  default: "typeOnly"

typeOnly:
  description: Extra packages to allow type only imports
  type: string[]
  default: []

ignore:
  description: List of patterns to ignore in the import statements
  type: string[]
  default:
    - "^\\." # relative paths (starts with a dot)
    - "^node:" # built-in modules (prefixed with "node:")
```

## packageDir option

If you're using workspaces or somehow running ESLint from different locations, you'd need an absolute path:

```javascript
// for CommonJS:
const options = {
  packageDir: __dirname,
};
```

```javascript
// for ESM:
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const options = {
  packageDir: dirname(fileURLToPath(import.meta.url)),
};
```
