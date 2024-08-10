import { afterAll, describe, it } from "bun:test";
import parser from "@typescript-eslint/parser";
import {
  type InvalidTestCase,
  RuleTester,
  type ValidTestCase,
} from "@typescript-eslint/rule-tester";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

export class Runner<
  Options extends readonly unknown[],
  MessageId extends string,
> {
  constructor(
    protected title: string,
    protected ruleModule: RuleModule<MessageId, Options>,
    protected scenarios: Record<
      string,
      (ValidTestCase<Options> | InvalidTestCase<MessageId, Options>) & {
        before?: () => void;
      }
    >,
  ) {
    RuleTester.afterAll = afterAll;
    RuleTester.describe = describe;
    RuleTester.it = (...[name, ...rest]: Parameters<typeof it>) => {
      const { before } = scenarios[name];
      before?.();
      it(name, ...rest);
    };
  }

  public run() {
    const tester = new RuleTester({
      languageOptions: { parser },
    });
    const [valid, invalid] = Object.keys(this.scenarios).reduce<
      [ValidTestCase<Options>[], InvalidTestCase<MessageId, Options>[]]
    >(
      ([withoutErrors, withErrors], name) => {
        const { before, ...scenario } = this.scenarios[name];
        ("errors" in scenario ? withErrors : withoutErrors).push({
          name,
          ...scenario,
        });
        return [withoutErrors, withErrors];
      },
      [[], []],
    );
    tester.run("dependencies", this.ruleModule, { valid, invalid });
  }
}
