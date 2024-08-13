import type {
  InvalidTestCase,
  ValidTestCase,
} from "@typescript-eslint/rule-tester";

export type SomeCase<
  Options extends readonly unknown[],
  MessageId extends string,
> = ValidTestCase<Options> | InvalidTestCase<MessageId, Options>;

export type Scenario<
  Options extends readonly unknown[],
  MessageId extends string,
> = SomeCase<Options, MessageId> & { name?: never; setup?: () => void };
