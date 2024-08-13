import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import { partition, values } from "ramda";
import { afterAll, describe, it } from "vitest";
import { isInvalid, toCases } from "./helpers";
import type { Scenario } from "./types";

export class Runner<
  Options extends readonly unknown[],
  MessageId extends string,
> {
  constructor(
    protected title: string,
    protected ruleModule: RuleModule<MessageId, Options>,
    protected scenarios: Record<string, Scenario<Options, MessageId>>,
  ) {
    RuleTester.afterAll = afterAll;
    RuleTester.describe = describe;
    RuleTester.it = (name, ...rest) => {
      const { setup } = scenarios[name];
      setup?.();
      it(name, ...rest);
    };
  }

  public run() {
    const tester = new RuleTester({ languageOptions: { parser } });

    const cases = values(toCases(this.scenarios));
    const [invalid, valid] = partition(isInvalid, cases);

    tester.run(this.title, this.ruleModule, { valid, invalid });
  }
}
