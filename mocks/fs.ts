import { vi } from "vitest";

export const readerMock = vi.fn();
vi.mock("node:fs", () => ({
  readFileSync: readerMock,
}));
