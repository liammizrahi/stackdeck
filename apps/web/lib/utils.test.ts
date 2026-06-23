import { describe, expect, it } from "vitest";
import { formatBytes, isConnectionError } from "@/lib/utils";

describe("formatBytes", () => {
  it("formats common sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });
});

describe("isConnectionError", () => {
  it("detects ECONNREFUSED and timeouts", () => {
    expect(isConnectionError({ code: "ECONNREFUSED" })).toBe(true);
    expect(isConnectionError({ name: "TimeoutError" })).toBe(true);
    expect(isConnectionError(new Error("connect ECONNREFUSED 127.0.0.1:4566"))).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isConnectionError(new Error("AccessDenied"))).toBe(false);
    expect(isConnectionError(null)).toBe(false);
  });
});
