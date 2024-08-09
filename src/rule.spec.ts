import { afterAll, beforeAll, describe, it, mock } from "bun:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { rule } from "./rule";
import { Runner } from "./runner.ts";

const readerMock = mock();
beforeAll(() => {
  mock.module("node:fs", () => ({
    readFileSync: readerMock,
  }));
});

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new Runner(
  {
    languageOptions: { parser },
  },
  (env) => {
    readerMock.mockReturnValueOnce(JSON.stringify(env));
  },
);

tester.run("dependencies", rule, {
  valid: [
    {
      name: "regular import of prod dependency",
      code: `import {} from "eslint"`,
      env: { dependencies: { eslint: "" } },
    },
    {
      name: "regular import of explicitly enabled prod dependencies",
      code: `import {} from "eslint"`,
      options: [{ production: true }],
      env: { dependencies: { eslint: "" } },
    },
    {
      name: "regular import of required peer dependency",
      code: `import {} from "eslint"`,
      env: { peerDependencies: { eslint: "" } },
    },
    {
      name: "type import of optional peer dependency",
      code: `import type {} from "eslint"`,
      env: {
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      },
    },
    {
      name: "type import of unlisted type only dependency",
      code: `import type {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      env: { dependencies: {} },
    },
    {
      name: "type import of prod dependency",
      code: `import type {} from "eslint"`,
      env: { dependencies: { eslint: "" } },
    },
    {
      name: "import a path of prod dependency",
      code: `import {} from "eslint/something/useful.js"`,
      env: { dependencies: { eslint: "" } },
    },
    {
      name: "import of scoped required peer dependency",
      code: `import {} from "@eslint/js/something"`,
      env: { peerDependencies: { "@eslint/js": "" } },
    },
    {
      name: "import of local path",
      code: `import {} from "./some/path.js"`,
      env: {},
    },
    {
      name: "import of built-in module",
      code: `import { readFileSync } from "node:fs"`,
      env: {},
    },
    {
      name: "import of something explicitly ignored by regex",
      code: `import {} from "fancy-module"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      env: {},
    },
  ],
  invalid: [
    {
      name: "regular import of unlisted dependency",
      code: `import {} from "eslint"`,
      env: { dependencies: {} },
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "regular import of explicitly disabled prod dependency",
      code: `import {} from "eslint"`,
      options: [{ production: false }],
      env: { dependencies: { eslint: "" } },
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "regular import of optional peer dependency",
      code: `import {} from "eslint"`,
      env: {
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      },
      errors: [{ messageId: "typeOnly" }],
    },
    {
      name: "regular import of unlisted type only dependency",
      code: `import {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      env: {},
      errors: [{ messageId: "typeOnly" }],
    },
    {
      name: "import of built-in module when missing in ignore list",
      code: `import {} from "node:fs"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      env: {},
      errors: [{ messageId: "prohibited" }],
    },
  ],
});