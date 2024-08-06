import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";
import { path, flip, partition, reject, startsWith } from "ramda";
import type { PackageJson } from "type-fest";

const messages = {
  prohibited: "Importing {{name}} is not allowed.",
  typeOnly: "Only 'import type' syntax is allowed for {{name}}.",
};

const createRule = ESLintUtils.RuleCreator.withoutDocs;
const excludeTypes = reject(startsWith("@types/"));
const getPackageName = (subject: string) =>
  subject
    .split("/")
    .slice(0, subject.startsWith("@") ? 2 : 1)
    .join("/");

const theRule = createRule<
  [
    {
      manifest: PackageJson.PackageJsonStandard;
      typeOnly?: string[];
    },
  ],
  keyof typeof messages
>({
  meta: {
    messages,
    type: "problem",
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          manifest: { type: "object" },
          typeOnly: { type: "array", items: { type: "string" } },
        },
        required: ["manifest"],
      },
    ],
  },
  defaultOptions: [{ manifest: {}, typeOnly: [] }],
  create: (ctx, [{ manifest, typeOnly: userTypeOnly = [] }]) => {
    const lookup = flip(path)(manifest);
    const isOptional = (name: string) =>
      lookup(["peerDependenciesMeta", name, "optional"]) as boolean;

    const allPeers = excludeTypes(Object.keys(manifest.peerDependencies || {}));
    const [optPeers, reqPeers] = partition(isOptional, allPeers);
    const production = Object.keys(manifest.dependencies || {});

    const allowed = production.concat(reqPeers);
    const typeOnly = optPeers.concat(userTypeOnly);

    return {
      ImportDeclaration: ({ source, importKind }) => {
        const isTypeImport = importKind === "type";
        if (
          !source.value.startsWith(".") &&
          !source.value.startsWith("node:")
        ) {
          const name = getPackageName(source.value);
          const commons = { node: source, data: { name } };
          if (isTypeImport) {
            if (!typeOnly.concat(allowed).includes(name)) {
              ctx.report({ ...commons, messageId: "typeOnly" });
            }
          } else {
            if (!allowed.includes(name)) {
              ctx.report({ ...commons, messageId: "typeOnly" });
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
