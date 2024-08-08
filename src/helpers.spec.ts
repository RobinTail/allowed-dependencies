import { describe, expect, it } from "bun:test";
import { getName } from "./helpers.ts";

describe("Helpers", () => {
  describe("getName()", () => {
    it.each([
      ["eslint", "eslint"],
      ["eslint/some/path", "eslint"],
      ["@eslint/js", "@eslint/js"],
      ["@eslint/js/some/path", "@eslint/js"],
    ])("returns the package name", (subj, exp) => {
      expect(getName(subj)).toBe(exp);
    });
  });
});
