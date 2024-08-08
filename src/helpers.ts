import { flow, join, split, startsWith, take } from "ramda";

/** is scoped import: starts with "at" */
const hasScope = startsWith("@");

/** gets the dependency name even when importing its internal path */
export const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);
