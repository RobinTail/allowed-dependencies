import { describe, expect, it } from "bun:test";
import { readerMock } from "../mocks/fs.ts";
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
    const sample = { name: "expected" };
    readerMock.mockReturnValueOnce(JSON.stringify(sample));
    expect(getManifest(".")).toEqual(sample);
    expect(readerMock).toHaveBeenCalledWith("package.json", "utf8");
  });
});
