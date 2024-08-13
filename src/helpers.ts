import { readFileSync } from "node:fs";
import { join as joinPath } from "node:path";
import { flow, join, split, startsWith, take } from "ramda";

/** is scoped import: starts with "at" */
const hasScope = startsWith("@");

/** gets the dependency name even when importing its internal path */
export const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);

export const getManifest = (path: string) => {
  const name = joinPath(path, "package.json");
  console.log(name);
  const raw = readFileSync(name, "utf8");
  console.log(raw);
  return JSON.parse(raw);
};
