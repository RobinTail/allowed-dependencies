import {
  type InvalidTestCase,
  RuleTester,
  type RuleTesterConfig,
  type ValidTestCase,
} from "@typescript-eslint/rule-tester";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

interface Environment {
  env?: Record<string, unknown>;
}

interface ValidCase<Options extends readonly unknown[]>
  extends ValidTestCase<Options>,
    Environment {}

interface InvalidCase<
  MessageIds extends string,
  Options extends readonly unknown[],
> extends InvalidTestCase<MessageIds, Options>,
    Environment {}

export interface RunTests<
  MessageIds extends string,
  Options extends readonly unknown[],
> {
  readonly valid: readonly ValidCase<Options>[];
  readonly invalid: readonly InvalidCase<MessageIds, Options>[];
}

export class Runner extends RuleTester {
  constructor(
    config?: RuleTesterConfig,
    protected beforeEach?: (env: Environment["env"]) => void,
  ) {
    super(config);
  }

  public override run<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    ruleName: string,
    rule: RuleModule<MessageIds, Options>,
    test: RunTests<MessageIds, Options>,
  ) {
    for (const { env, ...rest } of test.valid) {
      this.beforeEach?.(env);
      super.run(ruleName, rule, { valid: [rest], invalid: [] });
    }
    for (const { env, ...rest } of test.invalid) {
      this.beforeEach?.(env);
      super.run(ruleName, rule, { valid: [], invalid: [rest] });
    }
  }
}
