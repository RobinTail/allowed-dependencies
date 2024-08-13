import { describe, expect, it } from "vitest";
import { options } from "./schema";

describe("Schema", () => {
  describe("options", () => {
    it("has the required props", () => {
      expect(options).toMatchSnapshot();
    });
  });
});
