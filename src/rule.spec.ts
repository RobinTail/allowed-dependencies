import { afterAll, beforeAll, describe, it, mock } from "bun:test";
import parser from "@typescript-eslint/parser";
import {
  type InvalidTestCase,
  RuleTester,
  type ValidTestCase,
} from "@typescript-eslint/rule-tester";
import { type MessageId, rule } from "./rule";
import type { Options } from "./schema.ts";

const readerMock = mock();
beforeAll(() => {
  mock.module("node:fs", () => ({
    readFileSync: readerMock,
  }));
});

const mockEnv = (env: object) =>
  readerMock.mockReturnValueOnce(JSON.stringify(env));

const scenarios: Record<
  string,
  {
    code: string;
    before?: () => void;
    options?: [Options];
    errors?: [{ messageId: MessageId }];
  }
> = {
  // Valid
  "regular import of prod dependency": {
    code: `import {} from "eslint"`,
    before: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "regular import of explicitly enabled prod dependencies": {
    code: `import {} from "eslint"`,
    options: [{ production: true }],
    before: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "regular import of required peer dependency": {
    code: `import {} from "eslint"`,
    before: () => mockEnv({ peerDependencies: { eslint: "" } }),
  },
  "type import of optional peer dependency": {
    code: `import type {} from "eslint"`,
    before: () =>
      mockEnv({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
  },
  "type import of unlisted type only dependency": {
    code: `import type {} from "eslint"`,
    options: [{ typeOnly: ["eslint"] }],
    before: () => mockEnv({ dependencies: {} }),
  },
  "type import of prod dependency": {
    code: `import type {} from "eslint"`,
    before: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "import a path of prod dependency": {
    code: `import {} from "eslint/something/useful.js"`,
    before: () => mockEnv({ dependencies: { eslint: "" } }),
  },
  "import of scoped required peer dependency": {
    code: `import {} from "@eslint/js/something"`,
    before: () => mockEnv({ peerDependencies: { "@eslint/js": "" } }),
  },
  "import of local path": {
    code: `import {} from "./some/path.js"`,
    before: () => mockEnv({}),
  },
  "import of built-in module": {
    code: `import { readFileSync } from "node:fs"`,
    before: () => mockEnv({}),
  },
  "import of something explicitly ignored by regex": {
    code: `import {} from "fancy-module"`,
    options: [{ ignore: ["^fancy-\\w+$"] }],
    before: () => mockEnv({}),
  },
  // Invalid
  "regular import of unlisted dependency": {
    code: `import {} from "eslint"`,
    before: () => mockEnv({ dependencies: {} }),
    errors: [{ messageId: "prohibited" }],
  },
  "regular import of explicitly disabled prod dependency": {
    code: `import {} from "eslint"`,
    options: [{ production: false }],
    before: () => mockEnv({ dependencies: { eslint: "" } }),
    errors: [{ messageId: "prohibited" }],
  },
  "regular import of optional peer dependency": {
    code: `import {} from "eslint"`,
    before: () =>
      mockEnv({
        peerDependencies: { eslint: "" },
        peerDependenciesMeta: { eslint: { optional: true } },
      }),
    errors: [{ messageId: "typeOnly" }],
  },
  "regular import of unlisted type only dependency": {
    code: `import {} from "eslint"`,
    options: [{ typeOnly: ["eslint"] }],
    before: () => mockEnv({}),
    errors: [{ messageId: "typeOnly" }],
  },
  "import of built-in module when missing in ignore list": {
    code: `import {} from "node:fs"`,
    options: [{ ignore: ["^fancy-\\w+$"] }],
    before: () => mockEnv({}),
    errors: [{ messageId: "prohibited" }],
  },
};

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = (...args: Parameters<typeof it>) => {
  const { before } = scenarios[args[0]];
  before?.();
  it(...args);
};

const tester = new RuleTester({
  languageOptions: { parser },
});

const [valid, invalid] = Object.keys(scenarios).reduce<
  [ValidTestCase<[Options]>[], InvalidTestCase<MessageId, [Options]>[]]
>(
  ([a, b], name) => {
    const { before, ...scenario } = scenarios[name];
    const hasErrors = "errors" in scenario;
    (hasErrors ? b : a).push({
      name,
      ...scenario,
    });
    return [a, b];
  },
  [[], []],
);

tester.run("dependencies", rule, { valid, invalid });
