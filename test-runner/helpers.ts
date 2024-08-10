import { has, mapObjIndexed } from "ramda";
import type { Scenario, SomeCase } from "./types.ts";

const caseFromScenario = <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  { setup, ...rest }: Scenario<Options, MessageId>,
  name: string,
): SomeCase<Options, MessageId> => ({ name, ...rest });

export const toCases = mapObjIndexed(caseFromScenario);

export const isInvalid = has("errors") as <
  Options extends readonly unknown[],
  MessageId extends string,
>(
  subject: SomeCase<Options, MessageId>,
) => subject is Extract<typeof subject, { errors: unknown }>;
