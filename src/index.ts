import {
  ESLintUtils,
  type JSONSchema,
  type TSESLint,
} from "@typescript-eslint/utils";
import type { FromSchema } from "json-schema-to-ts";
import {
  path,
  apply,
  either,
  flatten,
  flip,
  flow,
  fromPairs,
  join,
  map,
  mapObjIndexed,
  partition,
  split,
  startsWith,
  take,
  values,
  xprod,
} from "ramda";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const isLocal = either(startsWith("."), startsWith("node:"));
const hasScope = startsWith("@");
const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);

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

const schema = {
  type: "object",
  properties: {
    manifest: manifestSchema,
    typeOnly: { type: "array", items: { type: "string" } },
    ...itemsSchema.properties,
  },
  additionalProperties: false,
  required: ["manifest"],
} as const satisfies JSONSchema.JSONSchema4;

const defaults: FromSchema<typeof schema> = {
  manifest: {},
  production: true,
  requiredPeers: true,
  optionalPeers: "typeOnly",
};

const theRule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages,
    type: "problem",
    schema: [schema],
  },
  defaultOptions: [defaults],
  create: (ctx, [{ manifest, typeOnly = [], ...rest }]) => {
    const lookup = flip(path)(manifest);
    const isOptional = (name: string) =>
      lookup(["peerDependenciesMeta", name, "optional"]) as boolean;
    const [optionalPeers, requiredPeers] = partition(
      isOptional,
      Object.keys(manifest.peerDependencies || {}),
    );

    const sources: Record<keyof typeof rest, string[]> = {
      production: Object.keys(manifest.dependencies || {}),
      requiredPeers,
      optionalPeers,
    };

    const take = (
      subj: (typeof rest)[keyof typeof rest],
      extra: string[] = [],
    ) =>
      flatten(
        values(mapObjIndexed((v, k) => (v === subj ? sources[k] : []), rest)),
      ).concat(extra);

    const [allowed, limited] = map(apply(take), [
      [true],
      ["typeOnly", typeOnly],
    ]);

    return {
      ImportDeclaration: ({ source, importKind }) => {
        if (!isLocal(source.value)) {
          const name = getName(source.value);
          if (!allowed.includes(name)) {
            if (importKind !== "type") {
              ctx.report({
                node: source,
                data: { name },
                messageId: limited.includes(name) ? "typeOnly" : "prohibited",
              });
            }
          }
        }
      },
    };
  },
});

export default {
  rules: { dependencies: theRule },
} satisfies TSESLint.Linter.Plugin;
