import { mock } from "bun:test";

export const readerMock = mock();
mock.module("node:fs", () => ({
  readFileSync: readerMock,
}));
