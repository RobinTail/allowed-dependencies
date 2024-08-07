import { describe, expect, it } from "bun:test";
import { options } from "./schema";

describe("Schema", () => {
  describe("options", () => {
    it("has the required props", () => {
      expect(options).toMatchSnapshot();
    });
  });
});
