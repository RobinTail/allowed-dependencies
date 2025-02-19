import { ESLintUtils } from "@typescript-eslint/utils";
import * as R from "ramda";
import { type Manifest, getManifest, getName } from "./helpers.ts";
import { type Category, type Options, type Value, options } from "./schema.ts";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const defaults: Options = {
  production: true,
  requiredPeers: true,
  development: "typeOnly",
  optionalPeers: "typeOnly",
};

const lookup = R.flip(R.path);
const slices: Value[] = [true, false, "typeOnly"];

const splitPeers = (manifest: Manifest) => {
  const isOptional = (name: string) =>
    lookup(manifest, ["peerDependenciesMeta", name, "optional"]) as boolean;
  const [optionalPeers, requiredPeers] = R.partition(
    isOptional,
    Object.keys(manifest.peerDependencies || {}),
  );
  return { requiredPeers, optionalPeers };
};

const makeIterator =
  (ctx: { cwd: string }) =>
  ({
    packageDir = ctx.cwd,
    typeOnly = [],
    ignore = ["^\\.", "^node:"],
    production = defaults.production,
    development = defaults.development,
    requiredPeers = defaults.requiredPeers,
    optionalPeers = defaults.optionalPeers,
  }: Options) => {
    const manifest = getManifest(packageDir);
    const sources: Record<Category, string[]> = {
      production: Object.keys(manifest.dependencies || {}),
      development: Object.keys(manifest.devDependencies || {}),
      ...splitPeers(manifest),
    };
    const controls = { production, development, requiredPeers, optionalPeers };
    const take = (value: Value) =>
      R.flatten(
        R.values(
          R.mapObjIndexed((v, k) => (v === value ? sources[k] : []), controls),
        ),
      );

    const [allowed, prohibited, limited] = R.map(take, slices);
    limited.push(...typeOnly);

    return { allowed, prohibited, limited, ignore };
  };

export const rule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages,
    type: "problem",
    schema: { type: "array", items: options },
  },
  defaultOptions: [...[defaults]],
  create: (ctx) => {
    const iterator = makeIterator(ctx);
    const combined = R.map(iterator, ctx.options.length ? ctx.options : [{}]);

    const [allowed, prohibited, limited, ignored] = R.map(
      (group) => R.flatten(R.pluck(group, combined)),
      ["allowed", "prohibited", "limited", "ignore"] as const,
    );

    const isIgnored = (imp: string) =>
      ignored.some((pattern) => new RegExp(pattern).test(imp));

    return {
      ImportDeclaration: ({ source, importKind }) => {
        if (isIgnored(source.value)) return;
        const name = getName(source.value);
        if (allowed.includes(name)) return;
        if (importKind === "type" && !prohibited.includes(name)) return;
        ctx.report({
          node: source,
          data: { name },
          messageId: limited.includes(name) ? "typeOnly" : "prohibited",
        });
      },
    };
  },
});
