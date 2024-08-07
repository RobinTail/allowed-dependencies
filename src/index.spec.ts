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
    expect(plugin).toMatchSnapshot();
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
    ],
  });
});
