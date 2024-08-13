import { describe, expect, it } from "vitest";
import plugin from "./index";

describe("The plugin", () => {
  it("should consist of one rule", () => {
    expect(Object.keys(plugin.rules)).toEqual(["dependencies"]);
  });
});
