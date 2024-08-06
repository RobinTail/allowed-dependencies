import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";
import type { FromSchema } from "json-schema-to-ts";
import { flip, partition, path, reject, startsWith } from "ramda";
import { schema } from "./schema";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const excludeTypes = reject(startsWith("@types/"));
const getPackageName = (subject: string) =>
  subject
    .split("/")
    .slice(0, subject.startsWith("@") ? 2 : 1)
    .join("/");

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
  create: (
    ctx,
    [
      {
        manifest,
        typeOnly = [],
        production: hasProd,
        requiredPeers: hasReqPeers,
        optionalPeers: hasOptPeers,
      },
    ],
  ) => {
    const lookup = flip(path)(manifest);
    const isOptional = (name: string) =>
      lookup(["peerDependenciesMeta", name, "optional"]) as boolean;
    const prod = Object.keys(manifest.dependencies || {});
    const peers = excludeTypes(Object.keys(manifest.peerDependencies || {}));
    const [optionalPeers, requiredPeers] = partition(isOptional, peers);

    const allowed = (hasProd === true ? prod : [])
      .concat(hasReqPeers === true ? requiredPeers : [])
      .concat(hasOptPeers === true ? optionalPeers : []);

    const limited = typeOnly
      .concat(hasProd === "typeOnly" ? prod : [])
      .concat(hasReqPeers === "typeOnly" ? requiredPeers : [])
      .concat(hasOptPeers === "typeOnly" ? optionalPeers : []);

    return {
      ImportDeclaration: ({ source, importKind }) => {
        const isTypeImport = importKind === "type";
        if (
          !source.value.startsWith(".") &&
          !source.value.startsWith("node:")
        ) {
          const name = getPackageName(source.value);
          const commons = { node: source, data: { name } };

          if (!allowed.includes(name)) {
            if (!isTypeImport) {
              ctx.report({
                ...commons,
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
