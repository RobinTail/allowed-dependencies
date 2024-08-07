import { either, flow, join, split, startsWith, take } from "ramda";

/** is local import: starts with dot or refers to a built-in node module */
export const isLocal = either(startsWith("."), startsWith("node:"));

/** is scoped import: starts with "at" */
const hasScope = startsWith("@");

/** gets the dependency name even when importing its internal path */
export const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);
