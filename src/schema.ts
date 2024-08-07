import type { JSONSchema } from "@typescript-eslint/utils";
import { fromPairs, xprod } from "ramda";

const value = {
  oneOf: [{ type: "boolean" }, { type: "string", enum: ["typeOnly"] }],
} as const satisfies JSONSchema.JSONSchema4;

const controls = {
  type: "object",
  properties: fromPairs(
    xprod(["production", "optionalPeers", "requiredPeers"] as const, [value]),
  ),
} as const satisfies JSONSchema.JSONSchema4;

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
    ...controls.properties,
  },
  additionalProperties: false,
  required: ["manifest"],
} as const satisfies JSONSchema.JSONSchema4;
