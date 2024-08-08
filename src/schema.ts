import type { JSONSchema } from "@typescript-eslint/utils";
import type { FromSchema } from "json-schema-to-ts";
import { fromPairs, xprod } from "ramda";

const value = {
  oneOf: [{ type: "boolean" }, { type: "string", enum: ["typeOnly"] }],
} as const satisfies JSONSchema.JSONSchema4;
export type Value = FromSchema<typeof value>;

const categories = fromPairs(
  xprod(["production", "optionalPeers", "requiredPeers"] as const, [value]),
);
export type Category = keyof typeof categories;

const manifest = {
  type: "object",
  properties: fromPairs(
    xprod(
      ["dependencies", "peerDependencies", "peerDependenciesMeta"] as const,
      [{ type: "object" } as const],
    ),
  ),
} as const satisfies JSONSchema.JSONSchema4;

export const options = {
  type: "object",
  properties: {
    manifest: manifest,
    typeOnly: { type: "array", items: { type: "string" } },
    ...categories,
  },
  additionalProperties: false,
  required: ["manifest"],
} as const satisfies JSONSchema.JSONSchema4;
export type Options = FromSchema<typeof options>;
