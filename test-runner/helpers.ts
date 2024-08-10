import type { InvalidTestCase } from "@typescript-eslint/rule-tester";
import { has } from "ramda";
import type { Scenario, SomeCase } from "./types.ts";

export const toCase = <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  { before, ...rest }: Scenario<Options, MessageId>,
  name: string,
): SomeCase<Options, MessageId> => ({ name, ...rest });

export const isInvalid = <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  entry: SomeCase<Options, MessageId>,
): entry is InvalidTestCase<MessageId, Options> => has("errors", entry);
