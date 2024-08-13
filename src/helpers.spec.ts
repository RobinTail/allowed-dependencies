import { describe, expect, it } from "bun:test";
import manifest from "../package.json";
import { getManifest, getName } from "./helpers.ts";

describe("Helpers", () => {
  describe("getName()", () => {
    it.each([
      ["eslint", "eslint"],
      ["eslint/some/path", "eslint"],
      ["@eslint/js", "@eslint/js"],
      ["@eslint/js/some/path", "@eslint/js"],
    ])("returns the package name for %s", (subj, exp) => {
      expect(getName(subj)).toBe(exp);
    });
  });

  describe("getManifest()", () => {
    console.log(process.cwd());
    expect(getManifest(process.cwd())).toEqual(manifest);
  });
});
