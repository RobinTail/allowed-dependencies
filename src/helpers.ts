import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as R from "ramda";

/** is scoped import: starts with "at" */
const hasScope = R.startsWith("@");

/** gets the dependency name even when importing its internal path */
export const getName = (imp: string) =>
  R.flow(imp, [R.split("/"), R.take(hasScope(imp) ? 2 : 1), R.join("/")]);

type Dependencies = Record<string, string>;
type PeerMeta = Record<string, { optional?: boolean }>;
export interface Manifest {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
  peerDependenciesMeta?: PeerMeta;
}

export const getManifest = (path: string) =>
  JSON.parse(readFileSync(join(path, "package.json"), "utf8")) as Manifest;
