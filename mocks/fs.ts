import { mock } from "bun:test";
import actual from "node:fs";

export const readerMock = mock();
mock.module("node:fs", () => ({
  ...actual,
  readFileSync: readerMock,
}));
