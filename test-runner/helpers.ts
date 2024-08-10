import { has } from "ramda";
import type { Scenario, SomeCase } from "./types.ts";

export const toCase = <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  { before, ...rest }: Scenario<Options, MessageId>,
  name: string,
): SomeCase<Options, MessageId> => ({ name, ...rest });

export const isInvalid = has("errors") as <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  subject: SomeCase<Options, MessageId>,
) => subject is Extract<typeof subject, { errors: unknown }>;
