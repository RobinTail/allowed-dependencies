import { ESLintUtils } from "@typescript-eslint/utils";
import { path, flatten, flip, mapObjIndexed, partition, values } from "ramda";
import { getManifest, getName } from "./helpers";
import { type Category, type Options, type Value, options } from "./schema";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const defaults: Options = {
  production: true,
  requiredPeers: true,
  optionalPeers: "typeOnly",
};

export const rule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages,
    type: "problem",
    schema: [options],
  },
  defaultOptions: [defaults],
  create: (
    ctx,
    [
      {
        packageDir = ctx.cwd,
        typeOnly = [],
        ignore = ["^\\.", "^node:"],
        ...rest
      },
    ],
  ) => {
    const manifest = getManifest(packageDir);
    const isIgnored = (imp: string) =>
      ignore.some((pattern) => new RegExp(pattern).test(imp));
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
        if (!isIgnored(source.value)) {
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
