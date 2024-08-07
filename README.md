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

- Node.js `^18.18.0 || ^20.9.0 || ^22.0.0`
- `eslint@^9.0.0`
- `typescript-eslint@^8.0.0`

## Installation

```shell
yarn add --dev eslint-plugin-allowed-dependencies
```

## Setup

Example of plugin setup and different ways to provide `package.json` data to it:

```javascript
// eslint.config.js or .mjs if you're developing in CommonJS environment
import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";

// For Node 18 and 20:
import manifest from "./package.json" assert { type: "json" };

// For Node 22:
// import manifest from "./package.json" with { type: "json" };

// For all those versions and the environments having no JSON import support:
// import { readFileSync } from "node:fs";
// const manifest = JSON.parse(readFileSync("./package.json", "utf8"));

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
          manifest, // these are defaults:
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

By default, the plugin is configured to check source code: production dependencies and mandatory peers are allowed to
import, but optional peers are allowed to be imported only as types.

```yaml
manifest:
  description: Your package.json data, required
  type: object
  required: true

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

typeOnly:
  description: Extra packages to allow type only imports
  type: string[]
  default: []
```
