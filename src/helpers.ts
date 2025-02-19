import { readFileSync } from "node:fs";
import { join as joinPath } from "node:path";
import { flow, join, split, startsWith, take } from "ramda";

/** is scoped import: starts with "at" */
const hasScope = startsWith("@");

/** gets the dependency name even when importing its internal path */
export const getName = (imp: string) =>
  flow(imp, [split("/"), take(hasScope(imp) ? 2 : 1), join("/")]);

type Dependencies = Record<string, string>;
type PeerMeta = Record<string, { optional?: boolean }>;
export interface Manifest {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
  peerDependenciesMeta?: PeerMeta;
}

export const getManifest = (path: string) =>
  JSON.parse(readFileSync(joinPath(path, "package.json"), "utf8")) as Manifest;
