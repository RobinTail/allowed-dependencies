import { describe, expect, it } from "vitest";
import manifest from "../package.json";
import { getManifest, getName } from "./helpers";

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
    it("should return the package.json interior", () => {
      expect(getManifest(".")).toEqual(manifest);
    });
  });
});
