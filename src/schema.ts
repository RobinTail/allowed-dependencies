import type { JSONSchema } from "@typescript-eslint/utils";
import type { FromSchema } from "json-schema-to-ts";
import * as R from "ramda";

const value = {
  oneOf: [{ type: "boolean" }, { type: "string", enum: ["typeOnly"] }],
} as const satisfies JSONSchema.JSONSchema4;
export type Value = FromSchema<typeof value>;

const categories = R.fromPairs(
  R.xprod(
    ["production", "optionalPeers", "requiredPeers", "development"] as const,
    [value],
  ),
);
export type Category = keyof typeof categories;

export const options = {
  type: "object",
  properties: {
    packageDir: { type: "string" },
    typeOnly: { type: "array", items: { type: "string" } },
    ignore: { type: "array", items: { type: "string", format: "regex" } },
    ...categories,
  },
  additionalProperties: false,
} as const satisfies JSONSchema.JSONSchema4;
export type Options = FromSchema<typeof options>;
