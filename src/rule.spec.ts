import { afterAll, describe, it } from "bun:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readerMock } from "../mocks/fs.ts";
import { rule } from "./rule";

const makeSetup = (env: object) => () =>
  readerMock.mockReturnValueOnce(JSON.stringify(env));

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parser } });

tester.run("dependencies", rule, {
  valid: [
    {
      name: "regular import of prod dependency",
      code: `import {} from "eslint"`,
      before: makeSetup({ dependencies: { eslint: "" } }),
    },
    {
      name: "regular import of explicitly enabled prod dependencies",
      code: `import {} from "eslint"`,
      options: [{ production: true }],
      before: makeSetup({ dependencies: { eslint: "" } }),
    },
    {
      name: "regular import of required peer dependency",
      code: `import {} from "eslint"`,
      before: makeSetup({ peerDependencies: { eslint: "" } }),
    },
    {
      name: "type import of optional peer dependency",
      code: `import type {} from "eslint"`,
      before: makeSetup({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
    },
    {
      name: "type import of unlisted type only dependency",
      code: `import type {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      before: makeSetup({ dependencies: {} }),
    },
    {
      name: "type import of prod dependency",
      code: `import type {} from "eslint"`,
      before: makeSetup({ dependencies: { eslint: "" } }),
    },
    {
      name: "import a path of prod dependency",
      code: `import {} from "eslint/something/useful.js"`,
      before: makeSetup({ dependencies: { eslint: "" } }),
    },
    {
      name: "import of scoped required peer dependency",
      code: `import {} from "@eslint/js/something"`,
      before: makeSetup({ peerDependencies: { "@eslint/js": "" } }),
    },
    {
      name: "import of local path",
      code: `import {} from "./some/path.js"`,
      before: makeSetup({}),
    },
    {
      name: "import of built-in module",
      code: `import { readFileSync } from "node:fs"`,
      before: makeSetup({}),
    },
    {
      name: "import of something explicitly ignored by regex",
      code: `import {} from "fancy-module"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      before: makeSetup({}),
    },
  ],
  invalid: [
    {
      name: "regular import of unlisted dependency",
      code: `import {} from "eslint"`,
      before: makeSetup({ dependencies: {} }),
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "regular import of explicitly disabled prod dependency",
      code: `import {} from "eslint"`,
      options: [{ production: false }],
      before: makeSetup({ dependencies: { eslint: "" } }),
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "regular import of optional peer dependency",
      code: `import {} from "eslint"`,
      before: makeSetup({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
      errors: [{ messageId: "typeOnly" }],
    },
    {
      name: "regular import of unlisted type only dependency",
      code: `import {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      before: makeSetup({}),
      errors: [{ messageId: "typeOnly" }],
    },
    {
      name: "import of built-in module when missing in ignore list",
      code: `import {} from "node:fs"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      before: makeSetup({}),
      errors: [{ messageId: "prohibited" }],
    },
    {
      name: "demo",
      code: `import {factory} from "typescript"; import {format} from "prettier";`,
      before: makeSetup({
        devDependencies: { typescript: "^5" },
        peerDependencies: { prettier: "^3" },
        peerDependenciesMeta: { prettier: { optional: true } },
      }),
      errors: [{ messageId: "prohibited" }, { messageId: "typeOnly" }],
    },
  ],
});
