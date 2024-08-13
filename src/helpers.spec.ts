import { describe, expect, it, mock } from "bun:test";
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

  describe("getManifest()", async () => {
    const readerMock = mock(() => `{ "devDependencies": { "eslint": "^9" } }`);
    const actualFs = await import("node:fs");
    mock.module("node:fs", () => ({
      ...actualFs,
      readFileSync: readerMock,
    }));

    it("should read the package.json file from the specified path", () => {
      expect(getManifest("./some/path")).toEqual({
        devDependencies: { eslint: "^9" },
      });
      expect(readerMock).toHaveBeenCalledWith("some/path/package.json", "utf8");
    });
  });
});
