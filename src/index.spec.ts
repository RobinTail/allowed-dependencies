import { describe, expect, it } from "bun:test";
import plugin from "./index";

describe("The plugin", () => {
  it("should consist of one rule", () => {
    expect(Object.keys(plugin.rules)).toEqual(["dependencies"]);
  });
});
