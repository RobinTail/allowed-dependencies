import { describe, expect, it } from "bun:test";
import { getName, isLocal } from "./helpers.ts";

describe("Helpers", () => {
  describe("isLocal()", () => {
    it.each(["./src", "../src", "node:utils"])("detects local", (subj) => {
      expect(isLocal(subj)).toBeTrue();
    });
    it.each(["eslint", "@eslint/js"])("detects non-local", (subj) => {
      expect(isLocal(subj)).toBeFalse();
    });
  });

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
