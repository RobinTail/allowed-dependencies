import { afterAll, describe, it } from "bun:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readerMock } from "../mocks/fs.ts";
import { rule } from "./rule";

const makeBefore =
  (...envs: object[]) =>
  () => {
    for (const env of envs) readerMock.mockReturnValueOnce(JSON.stringify(env));
  };

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parser } });

tester.run("dependencies", rule, {
  valid: [
    {
      name: "regular import of prod dependency",
      code: `import {} from "eslint"`,
      before: makeBefore({ dependencies: { eslint: "" } }),
    },
    {
      name: "regular import of explicitly enabled prod dependencies",
      code: `import {} from "eslint"`,
      options: [{ production: true }],
      before: makeBefore({ dependencies: { eslint: "" } }),
    },
    {
      name: "regular import of required peer dependency",
      code: `import {} from "eslint"`,
      before: makeBefore({ peerDependencies: { eslint: "" } }),
    },
    {
      name: "type import of optional peer dependency",
      code: `import type {} from "eslint"`,
      before: makeBefore({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
    },
    {
      name: "type import of unlisted type only dependency",
      code: `import type {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      before: makeBefore({ dependencies: {} }),
    },
    {
      name: "type import of prod dependency",
      code: `import type {} from "eslint"`,
      before: makeBefore({ dependencies: { eslint: "" } }),
    },
    {
      name: "import a path of prod dependency",
      code: `import {} from "eslint/something/useful.js"`,
      before: makeBefore({ dependencies: { eslint: "" } }),
    },
    {
      name: "import of scoped required peer dependency",
      code: `import {} from "@eslint/js/something"`,
      before: makeBefore({ peerDependencies: { "@eslint/js": "" } }),
    },
    {
      name: "import of local path",
      code: `import {} from "./some/path.js"`,
      before: makeBefore({}),
    },
    {
      name: "import of built-in module",
      code: `import { readFileSync } from "node:fs"`,
      before: makeBefore({}),
    },
    {
      name: "import of something explicitly ignored by regex",
      code: `import {} from "fancy-module"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      before: makeBefore({}),
    },
    {
      name: "type import of accordingly enabled devDependency",
      code: `import type {} from "eslint"`,
      options: [{ development: "typeOnly" }],
      before: makeBefore({ devDependencies: { eslint: "" } }),
    },
    {
      name: "multiple options",
      code: `import {} from "fancy-module"; import type {} from "eslint";`,
      options: [{ production: true }, { development: "typeOnly" }],
      before: makeBefore(
        { dependencies: { "fancy-module": "" } },
        { devDependencies: { eslint: "" } },
      ),
    },
  ],
  invalid: [
    {
      name: "regular import of unlisted dependency",
      code: `import {} from "eslint"`,
      before: makeBefore({ dependencies: {} }),
      errors: [{ messageId: "prohibited", data: { name: "eslint" } }],
    },
    {
      name: "regular import of explicitly disabled prod dependency",
      code: `import {} from "eslint"`,
      options: [{ production: false }],
      before: makeBefore({ dependencies: { eslint: "" } }),
      errors: [{ messageId: "prohibited", data: { name: "eslint" } }],
    },
    {
      name: "regular import of optional peer dependency",
      code: `import {} from "eslint"`,
      before: makeBefore({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
      errors: [{ messageId: "typeOnly", data: { name: "eslint" } }],
    },
    {
      name: "regular import of unlisted type only dependency",
      code: `import {} from "eslint"`,
      options: [{ typeOnly: ["eslint"] }],
      before: makeBefore({}),
      errors: [{ messageId: "typeOnly", data: { name: "eslint" } }],
    },
    {
      name: "import of built-in module when missing in ignore list",
      code: `import {} from "node:fs"`,
      options: [{ ignore: ["^fancy-\\w+$"] }],
      before: makeBefore({}),
      errors: [{ messageId: "prohibited", data: { name: "node:fs" } }],
    },
    {
      name: "demo",
      code: `import {factory} from "typescript"; import {format} from "prettier";`,
      before: makeBefore({
        devDependencies: { typescript: "^5" },
        peerDependencies: { prettier: "^3" },
        peerDependenciesMeta: { prettier: { optional: true } },
      }),
      errors: [
        { messageId: "prohibited", data: { name: "typescript" } },
        { messageId: "typeOnly", data: { name: "prettier" } },
      ],
    },
  ],
});
