import type { JSONSchema } from "@typescript-eslint/utils";
import { fromPairs, xprod } from "ramda";

const valueSchema = {
  oneOf: [{ type: "boolean" }, { type: "string", enum: ["typeOnly"] }],
} as const satisfies JSONSchema.JSONSchema4;

const itemsSchema = {
  type: "object",
  properties: fromPairs(
    xprod(["production", "optionalPeers", "requiredPeers"] as const, [
      valueSchema,
    ]),
  ),
} as const satisfies JSONSchema.JSONSchema4;

const manifestSchema = {
  type: "object",
  properties: fromPairs(
    xprod(
      ["dependencies", "peerDependencies", "peerDependenciesMeta"] as const,
      [{ type: "object" } as const],
    ),
  ),
} as const satisfies JSONSchema.JSONSchema4;

export const schema = {
  type: "object",
  properties: {
    manifest: manifestSchema,
    typeOnly: { type: "array", items: { type: "string" } },
    ...itemsSchema.properties,
  },
  additionalProperties: false,
  required: ["manifest"],
} as const satisfies JSONSchema.JSONSchema4;
