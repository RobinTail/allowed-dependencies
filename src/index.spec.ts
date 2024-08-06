import { afterAll, describe, expect, it } from "bun:test";
import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import plugin from "./index";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
const tester = new RuleTester({
  languageOptions: { parser },
});

describe("Allowed dependencies", () => {
  it("should consist of one rule", () => {
    expect(plugin).toMatchSnapshot();
  });

  tester.run("dependencies", plugin.rules.dependencies, {
    valid: [
      {
        code: `import {} from "eslint"`,
        options: [{ manifest: { dependencies: { eslint: "" } } }],
      },
    ],
    invalid: [
      {
        code: `import {} from "eslint"`,
        options: [{ manifest: { dependencies: {} } }],
        errors: [{ messageId: "typeOnly" }], // @todo should be prohibited
      },
    ],
  });
});
