import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";
import type { FromSchema } from "json-schema-to-ts";
import { path, flatten, flip, mapObjIndexed, partition, values } from "ramda";
import { getName, isLocal } from "./helpers.ts";
import { type Category, type Value, options } from "./schema.ts";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const defaults: FromSchema<typeof options> = {
  manifest: {},
  production: true,
  requiredPeers: true,
  optionalPeers: "typeOnly",
};

const theRule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages,
    type: "problem",
    schema: [options],
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

    const sources: Record<Category, string[]> = {
      production: Object.keys(manifest.dependencies || {}),
      requiredPeers,
      optionalPeers,
    };

    const take = (value: Value) =>
      flatten(
        values(mapObjIndexed((v, k) => (v === value ? sources[k] : []), rest)),
      );

    const [allowed, limited] = [true, "typeOnly" as const].map(take);
    limited.push(...typeOnly);

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
