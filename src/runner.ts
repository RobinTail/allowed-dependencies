import { afterAll, describe, it } from "bun:test";
import parser from "@typescript-eslint/parser";
import {
  type InvalidTestCase,
  RuleTester,
  type ValidTestCase,
} from "@typescript-eslint/rule-tester";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import { has, mapObjIndexed, partition, values } from "ramda";

type SomeCase<Options extends readonly unknown[], MessageId extends string> =
  | ValidTestCase<Options>
  | InvalidTestCase<MessageId, Options>;

type Scenario<
  Options extends readonly unknown[],
  MessageId extends string,
> = SomeCase<Options, MessageId> & {
  before?: () => void;
};

const toCase = <Options extends readonly unknown[], MessageId extends string>(
  { before, ...v }: Scenario<Options, MessageId>,
  name: string,
): SomeCase<Options, MessageId> => ({
  name,
  ...v,
});

const isInvalid = <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  entry: SomeCase<Options, MessageId>,
): entry is InvalidTestCase<MessageId, Options> => has("errors", entry);

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

    const cases = values(mapObjIndexed(toCase, this.scenarios));
    const [invalid, valid] = partition(isInvalid, cases);

    tester.run(this.title, this.ruleModule, { valid, invalid });
  }
}
