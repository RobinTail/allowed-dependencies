import { vi, Mock } from "vitest";

export const readerMock: Mock = vi.fn();

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  return { ...actual, readFileSync: readerMock };
});
