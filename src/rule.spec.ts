import { afterAll, beforeAll, describe, it, mock } from "bun:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { rule } from "./rule";

const packages = [
  { dependencies: { eslint: "" } },
  { dependencies: { eslint: "" } },
  { peerDependencies: { eslint: "" } },
  {
    peerDependencies: { eslint: "" },
    peerDependenciesMeta: { eslint: { optional: true } },
  },
  { dependencies: {} },
  { dependencies: { eslint: "" } },
  { dependencies: { eslint: "" } },
  { peerDependencies: { "@eslint/js": "" } },
  {},
  {},
  {},
  { dependencies: {} },
  { dependencies: { eslint: "" } },
  {
    peerDependencies: { eslint: "" },
    peerDependenciesMeta: { eslint: { optional: true } },
  },
  {},
  {},
];

const manifestGenerator = (function* () {
  for (const manifest of packages) {
    yield manifest;
  }
})();

const readerMock = mock();
beforeAll(() => {
  mock.module("node:fs", () => ({
    readFileSync: readerMock,
  }));
});

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = (...args: Parameters<typeof it>) => {
  readerMock.mockReturnValueOnce(
    JSON.stringify(manifestGenerator.next().value),
  );
  it(...args);
};

const tester = new RuleTester({
  languageOptions: { parser },
});

tester.run("dependencies", rule, {
  valid: [
    {
      name: "regular import of prod dependency",
      code: `import {} from "eslint"`,
    },
    {
      name: "regular import of explicitly enabled prod dependencies",
      code: `import {} from "eslint"`,
      options: [{ production: true }],
    },
    {
      name: "regular import of required peer dependency",
      code: `import {} from "eslint"`,
    },
    {
      name: "type import of optional peer dependency",
      code: `import type {} from "eslint"`,
    },
    {
      name: "type import of unlisted type only dependency",
      code: `import type {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
    },
    {
      name: "type import of prod dependency",
      code: `import type {} from "eslint"`,
    },
    {
      name: "import a path of prod dependency",
      code: `import {} from "eslint/something/useful.js"`,
    },
    {
      name: "import of scoped required peer dependency",
      code: `import {} from "@eslint/js/something"`,
    },
    {
      name: "import of local path",
      code: `import {} from "./some/path.js"`,
    },
    {
      name: "import of built-in module",
      code: `import { readFileSync } from "node:fs"`,
    },
    {
      name: "import of something explicitly ignored by regex",
      code: `import {} from "fancy-module"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
    },
  ],
  invalid: [
    {
      name: "regular import of unlisted dependency",
      code: `import {} from "eslint"`,
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "regular import of explicitly disabled prod dependency",
      code: `import {} from "eslint"`,
      options: [{ production: false }],
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "regular import of optional peer dependency",
      code: `import {} from "eslint"`,
      errors: [{ messageId: "typeOnly" }],
    },
    {
      name: "regular import of unlisted type only dependency",
      code: `import {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      errors: [{ messageId: "typeOnly" }],
    },
    {
      name: "import of built-in module when missing in ignore list",
      code: `import {} from "node:fs"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      errors: [{ messageId: "prohibited" }],
    },
  ],
});
