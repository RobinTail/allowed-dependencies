import { afterAll } from "bun:test";
import { readerMock } from "../mocks/fs.ts";
import { Runner } from "../test-runner";
import { rule } from "./rule";

const makeSetup = (env: object) => () =>
  readerMock.mockReturnValueOnce(JSON.stringify(env));

afterAll(() => {
  // biome-ignore lint/performance/noDelete: <explanation>
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  delete require.cache["fs"];
});

new Runner("dependencies", rule, {
  // Valid
  "regular import of prod dependency": {
    code: `import {} from "eslint"`,
    setup: makeSetup({ dependencies: { eslint: "" } }),
  },
  "regular import of explicitly enabled prod dependencies": {
    code: `import {} from "eslint"`,
    options: [{ production: true }],
    setup: makeSetup({ dependencies: { eslint: "" } }),
  },
  "regular import of required peer dependency": {
    code: `import {} from "eslint"`,
    setup: makeSetup({ peerDependencies: { eslint: "" } }),
  },
  "type import of optional peer dependency": {
    code: `import type {} from "eslint"`,
    setup: makeSetup({
      peerDependencies: { eslint: "" },
      peerDependenciesMeta: { eslint: { optional: true } },
    }),
  },
  "type import of unlisted type only dependency": {
    code: `import type {} from "eslint"`,
    options: [{ typeOnly: ["eslint"] }],
    setup: makeSetup({ dependencies: {} }),
  },
  "type import of prod dependency": {
    code: `import type {} from "eslint"`,
    setup: makeSetup({ dependencies: { eslint: "" } }),
  },
  "import a path of prod dependency": {
    code: `import {} from "eslint/something/useful.js"`,
    setup: makeSetup({ dependencies: { eslint: "" } }),
  },
  "import of scoped required peer dependency": {
    code: `import {} from "@eslint/js/something"`,
    setup: makeSetup({ peerDependencies: { "@eslint/js": "" } }),
  },
  "import of local path": {
    code: `import {} from "./some/path.js"`,
    setup: makeSetup({}),
  },
  "import of built-in module": {
    code: `import { readFileSync } from "node:fs"`,
    setup: makeSetup({}),
  },
  "import of something explicitly ignored by regex": {
    code: `import {} from "fancy-module"`,
    options: [{ ignore: ["^fancy-\\w+$"] }],
    setup: makeSetup({}),
  },
  // Invalid
  "regular import of unlisted dependency": {
    code: `import {} from "eslint"`,
    setup: makeSetup({ dependencies: {} }),
    errors: [{ messageId: "prohibited" }],
  },
  "regular import of explicitly disabled prod dependency": {
    code: `import {} from "eslint"`,
    options: [{ production: false }],
    setup: makeSetup({ dependencies: { eslint: "" } }),
    errors: [{ messageId: "prohibited" }],
  },
  "regular import of optional peer dependency": {
    code: `import {} from "eslint"`,
    setup: makeSetup({
      peerDependencies: { eslint: "" },
      peerDependenciesMeta: { eslint: { optional: true } },
    }),
    errors: [{ messageId: "typeOnly" }],
  },
  "regular import of unlisted type only dependency": {
    code: `import {} from "eslint"`,
    options: [{ typeOnly: ["eslint"] }],
    setup: makeSetup({}),
    errors: [{ messageId: "typeOnly" }],
  },
  "import of built-in module when missing in ignore list": {
    code: `import {} from "node:fs"`,
    options: [{ ignore: ["^fancy-\\w+$"] }],
    setup: makeSetup({}),
    errors: [{ messageId: "prohibited" }],
  },
  demo: {
    code: `import {factory} from "typescript"; import {format} from "prettier";`,
    setup: makeSetup({
      devDependencies: { typescript: "^5" },
      peerDependencies: { prettier: "^3" },
      peerDependenciesMeta: { prettier: { optional: true } },
    }),
    errors: [{ messageId: "prohibited" }, { messageId: "typeOnly" }],
  },
}).run();
