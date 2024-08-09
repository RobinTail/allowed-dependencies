import { flow, join, split, startsWith, take } from "ramda";
import {join as joinPath} from "node:path";
import {readFileSync} from "node:fs";

/** is scoped import: starts with "at" */
const hasScope = startsWith("@");

/** gets the dependency name even when importing its internal path */
export const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);

export const getManifest = (path: string) => JSON.parse(
  readFileSync(joinPath(path, "package.json"), "utf8"),
)
