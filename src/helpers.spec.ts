import { describe, expect, it } from "bun:test";
import { readerMock } from "../mocks/fs.ts";
import { getManifest, getName, splitPeers } from "./helpers.ts";

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
      const sample = { name: "expected" };
      readerMock.mockReturnValueOnce(JSON.stringify(sample));
      expect(getManifest("./some/dir")).toEqual(sample);
      expect(readerMock).toHaveBeenCalledWith("some/dir/package.json", "utf8");
    });
  });

  describe("splitPeers()", () => {
    it("should divide peer dependencies into required and optional", () => {
      expect(
        splitPeers({
          peerDependencies: {
            one: "",
            two: "",
            three: "",
            four: "",
            five: "",
          },
          peerDependenciesMeta: {
            one: { optional: false },
            two: { optional: true },
            three: { optional: undefined },
            four: { optional: 123 as unknown as boolean },
          },
        }),
      ).toEqual({
        optionalPeers: ["two"],
        requiredPeers: ["one", "three", "four", "five"],
      });
    });
  });
});
