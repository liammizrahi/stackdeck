import { describe, expect, it } from "vitest";
import { runShell, shellEnv } from "./cloudshell";

describe("shellEnv", () => {
  it("injects AWS settings into the environment", () => {
    const env = shellEnv();
    expect(env.AWS_ENDPOINT_URL).toBe("http://localhost:4566");
    expect(env.AWS_REGION).toBe("us-east-1");
    expect(env.AWS_DEFAULT_REGION).toBe("us-east-1");
    expect(env.AWS_ACCESS_KEY_ID).toBe("test");
    expect(env.AWS_PAGER).toBe("");
  });
});

describe("runShell", () => {
  it("captures stdout and a zero exit code on success", async () => {
    const result = await runShell("echo hello");
    expect(result.stdout.trim()).toBe("hello");
    expect(result.code).toBe(0);
  });

  it("exposes the AWS endpoint to the command", async () => {
    const result = await runShell("printf %s \"$AWS_ENDPOINT_URL\"");
    expect(result.stdout).toBe("http://localhost:4566");
  });

  it("reports a non-zero exit code and stderr on failure", async () => {
    const result = await runShell("echo oops >&2; exit 3");
    expect(result.code).toBe(3);
    expect(result.stderr).toContain("oops");
  });
});
