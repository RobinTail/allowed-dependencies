import { ESLintUtils } from "@typescript-eslint/utils";
import {
  path,
  flatten,
  flip,
  map,
  mapObjIndexed,
  partition,
  pluck,
  values,
} from "ramda";
import { type Manifest, getManifest, getName } from "./helpers.ts";
import { type Category, type Options, type Value, options } from "./schema.ts";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const defaults: Options = {
  production: true,
  requiredPeers: true,
  development: false,
  optionalPeers: "typeOnly",
};

const lookup = flip(path);

const splitPeers = (manifest: Manifest) => {
  const isOptional = (name: string) =>
    lookup(manifest, ["peerDependenciesMeta", name, "optional"]) as boolean;
  const [optionalPeers, requiredPeers] = partition(
    isOptional,
    Object.keys(manifest.peerDependencies || {}),
  );
  return { requiredPeers, optionalPeers };
};

const processOptions =
  (ctx: { cwd: string }) =>
  ({
    packageDir = ctx.cwd,
    typeOnly = [],
    ignore = ["^\\.", "^node:"],
    ...rest
  }: Options) => {
    const manifest = getManifest(packageDir);
    const sources: Record<Category, string[]> = {
      production: Object.keys(manifest.dependencies || {}),
      development: Object.keys(manifest.devDependencies || {}),
      ...splitPeers(manifest),
    };

    const take = (value: Value) =>
      flatten(
        values(mapObjIndexed((v, k) => (v === value ? sources[k] : []), rest)),
      );

    const [allowed, limited] = [true, "typeOnly" as const].map(take);
    limited.push(...typeOnly);

    return { allowed, limited, ignore };
  };

export const rule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages,
    type: "problem",
    schema: {
      type: "array",
      uniqueItems: true,
      items: options,
    },
  },
  defaultOptions: [defaults],
  create: (ctx, options) => {
    const combined = map(processOptions(ctx), options);

    const [allowed, limited, ignored] = map(
      (group) => flatten(pluck(group, combined)),
      ["allowed", "limited", "ignore"] as const,
    );

    const isIgnored = (imp: string) =>
      ignored.some((pattern) => new RegExp(pattern!).test(imp)); // @todo check undefined

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
