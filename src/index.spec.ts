import { afterAll, describe, expect, it } from "bun:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import plugin from "./index";

describe("Allowed dependencies", () => {
  RuleTester.afterAll = afterAll;
  RuleTester.describe = describe;
  RuleTester.it = it;
  const tester = new RuleTester({
    languageOptions: { parser },
  });

  it("should consist of one rule", () => {
    expect(Object.keys(plugin.rules)).toEqual(["dependencies"]);
  });

  tester.run("dependencies", plugin.rules.dependencies, {
    valid: [
      {
        name: "regular import of prod dependency",
        code: `import {} from "eslint"`,
        options: [{ manifest: { dependencies: { eslint: "" } } }],
      },
      {
        name: "regular import of explicitly enabled prod dependencies",
        code: `import {} from "eslint"`,
        options: [
          { manifest: { dependencies: { eslint: "" } }, production: true },
        ],
      },
      {
        name: "regular import of required peer dependency",
        code: `import {} from "eslint"`,
        options: [{ manifest: { peerDependencies: { eslint: "" } } }],
      },
      {
        name: "type import of optional peer dependency",
        code: `import type {} from "eslint"`,
        options: [
          {
            manifest: {
              peerDependencies: { eslint: "" },
              peerDependenciesMeta: { eslint: { optional: true } },
            },
          },
        ],
      },
      {
        name: "type import of unlisted type only dependency",
        code: `import type {} from "eslint"`,
        options: [{ manifest: { dependencies: {} }, typeOnly: ["eslint"] }],
      },
      {
        name: "type import of prod dependency",
        code: `import type {} from "eslint"`,
        options: [{ manifest: { dependencies: { eslint: "" } } }],
      },
      {
        name: "import a path of prod dependency",
        code: `import {} from "eslint/something/useful.js"`,
        options: [{ manifest: { dependencies: { eslint: "" } } }],
      },
      {
        name: "import of scoped required peer dependency",
        code: `import {} from "@eslint/js/something"`,
        options: [{ manifest: { peerDependencies: { "@eslint/js": "" } } }],
      },
      {
        name: "import of local path",
        code: `import {} from "./some/path.js"`,
        options: [{ manifest: {} }],
      },
      {
        name: "import of built-in module",
        code: `import { readFileSync } from "node:fs"`,
        options: [{ manifest: {} }],
      },
      {
        name: "import of something explicitly ignored by regex",
        code: `import {} from "fancy-module"`,
        options: [{ manifest: {}, ignore: ["^fancy-\\w+$"] }],
      },
    ],
    invalid: [
      {
        name: "regular import of unlisted dependency",
        code: `import {} from "eslint"`,
        options: [{ manifest: { dependencies: {} } }],
        errors: [{ messageId: "prohibited" }],
      },
      {
        name: "regular import of explicitly disabled prod dependency",
        code: `import {} from "eslint"`,
        options: [
          { manifest: { dependencies: { eslint: "" } }, production: false },
        ],
        errors: [{ messageId: "prohibited" }],
      },
      {
        name: "regular import of optional peer dependency",
        code: `import {} from "eslint"`,
        options: [
          {
            manifest: {
              peerDependencies: { eslint: "" },
              peerDependenciesMeta: { eslint: { optional: true } },
            },
          },
        ],
        errors: [{ messageId: "typeOnly" }],
      },
      {
        name: "regular import of unlisted type only dependency",
        code: `import {} from "eslint"`,
        options: [{ manifest: {}, typeOnly: ["eslint"] }],
        errors: [{ messageId: "typeOnly" }],
      },
      {
        name: "import of built-in module when missing in ignore list",
        code: `import {} from "node:fs"`,
        options: [{ manifest: {}, ignore: ["^fancy-\\w+$"] }],
        errors: [{ messageId: "prohibited" }],
      },
    ],
  });
});
