import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";
import type { FromSchema } from "json-schema-to-ts";
import {
  path,
  apply,
  either,
  flatten,
  flip,
  flow,
  join,
  map,
  mapObjIndexed,
  partition,
  split,
  startsWith,
  take,
  values,
} from "ramda";
import { options } from "./schema.ts";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const isLocal = either(startsWith("."), startsWith("node:"));
const hasScope = startsWith("@");
const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);

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

    const sources: Record<keyof typeof rest, string[]> = {
      production: Object.keys(manifest.dependencies || {}),
      requiredPeers,
      optionalPeers,
    };

    const take = (subj: (typeof rest)[keyof typeof rest]) =>
      flatten(
        values(mapObjIndexed((v, k) => (v === subj ? sources[k] : []), rest)),
      );

    const [allowed, limited] = map(apply(take), [[true], ["typeOnly"]]);

    return {
      ImportDeclaration: ({ source, importKind }) => {
        if (!isLocal(source.value)) {
          const name = getName(source.value);
          if (!allowed.includes(name)) {
            if (importKind !== "type") {
              ctx.report({
                node: source,
                data: { name },
                messageId: limited.concat(typeOnly).includes(name)
                  ? "typeOnly"
                  : "prohibited",
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
