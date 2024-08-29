import { describe, expect, it } from "bun:test";
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
    it("should read the package.json from the specified path", () => {
      expect(getManifest(process.cwd())).toHaveProperty(
        "name",
        "eslint-plugin-allowed-dependencies",
      );
    });
  });
});
