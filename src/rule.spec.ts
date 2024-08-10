import { mock } from "bun:test";
import { Runner } from "../test-runner";
import { rule } from "./rule";

const readerMock = mock();
mock.module("node:fs", () => ({
  readFileSync: readerMock,
}));

const mockEnv = (env: object) =>
  readerMock.mockReturnValueOnce(JSON.stringify(env));

new Runner("dependencies", rule, {
  // Valid
  "regular import of prod dependency": {
    code: `import {} from "eslint"`,
    setup: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "regular import of explicitly enabled prod dependencies": {
    code: `import {} from "eslint"`,
    options: [{ production: true }],
    setup: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "regular import of required peer dependency": {
    code: `import {} from "eslint"`,
    setup: () => mockEnv({ peerDependencies: { eslint: "" } }),
  },
  "type import of optional peer dependency": {
    code: `import type {} from "eslint"`,
    setup: () =>
      mockEnv({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
  },
  "type import of unlisted type only dependency": {
    code: `import type {} from "eslint"`,
    options: [{ typeOnly: ["eslint"] }],
    setup: () => mockEnv({ dependencies: {} }),
  },
  "type import of prod dependency": {
    code: `import type {} from "eslint"`,
    setup: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "import a path of prod dependency": {
    code: `import {} from "eslint/something/useful.js"`,
    setup: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "import of scoped required peer dependency": {
    code: `import {} from "@eslint/js/something"`,
    setup: () => mockEnv({ peerDependencies: { "@eslint/js": "" } }),
  },
  "import of local path": {
    code: `import {} from "./some/path.js"`,
    setup: () => mockEnv({}),
  },
  "import of built-in module": {
    code: `import { readFileSync } from "node:fs"`,
    setup: () => mockEnv({}),
  },
  "import of something explicitly ignored by regex": {
    code: `import {} from "fancy-module"`,
    options: [{ ignore: ["^fancy-\\w+$"] }],
    setup: () => mockEnv({}),
  },
  // Invalid
  "regular import of unlisted dependency": {
    code: `import {} from "eslint"`,
    setup: () => mockEnv({ dependencies: {} }),
    errors: [{ messageId: "prohibited" }],
  },
  "regular import of explicitly disabled prod dependency": {
    code: `import {} from "eslint"`,
    options: [{ production: false }],
    setup: () => mockEnv({ dependencies: { eslint: "" } }),
    errors: [{ messageId: "prohibited" }],
  },
  "regular import of optional peer dependency": {
    code: `import {} from "eslint"`,
    setup: () =>
      mockEnv({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
    errors: [{ messageId: "typeOnly" }],
  },
  "regular import of unlisted type only dependency": {
    code: `import {} from "eslint"`,
    options: [{ typeOnly: ["eslint"] }],
    setup: () => mockEnv({}),
    errors: [{ messageId: "typeOnly" }],
  },
  "import of built-in module when missing in ignore list": {
    code: `import {} from "node:fs"`,
    options: [{ ignore: ["^fancy-\\w+$"] }],
    setup: () => mockEnv({}),
    errors: [{ messageId: "prohibited" }],
  },
  demo: {
    code: `import {factory} from "typescript"; import {format} from "prettier";`,
    setup: () =>
      mockEnv({
        devDependencies: { typescript: "^5" },
        peerDependencies: { prettier: "^3" },
        peerDependenciesMeta: { prettier: { optional: true } },
      }),
    errors: [{ messageId: "prohibited" }, { messageId: "typeOnly" }],
  },
}).run();
