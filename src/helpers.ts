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
  [K: string]: unknown;
}

export const getManifest = (path: string) =>
  JSON.parse(readFileSync(join(path, "package.json"), "utf8")) as Manifest;

export const splitPeers = (manifest: Manifest) => {
  const isOptional = (name: string) =>
    manifest.peerDependenciesMeta?.[name]?.optional === true;
  const [optionalPeers, requiredPeers] = R.partition(
    isOptional,
    Object.keys(manifest.peerDependencies || {}),
  );
  return { requiredPeers, optionalPeers };
};

export const mapTuple = <V extends R.Tuple<unknown, number>, U>(
  fn: (n: V extends R.Tuple<infer T, number> ? T : never) => U,
  dict: V,
) => R.map(fn, dict) as R.Tuple<U, (typeof dict)["length"]>;
