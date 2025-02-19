import { ESLintUtils } from "@typescript-eslint/utils";
import * as R from "ramda";
import { getManifest, getName, splitPeers } from "./helpers.ts";
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

const values: Value[] = [true, false, "typeOnly"];

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

    const [allowed, prohibited, limited] = R.map(take, values);
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

    const patterns = R.map(R.constructN(1, RegExp), ignored);
    const tester = R.invoker(1, "test");
    const isIgnored = (name: string) => R.any(tester(name), patterns);

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
