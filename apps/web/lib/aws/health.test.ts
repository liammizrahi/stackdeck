import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { checkHealth } from "@/lib/aws/health";

const sts = mockClient(STSClient);

afterEach(() => sts.reset());

describe("checkHealth", () => {
  it("reports connected with account on success", async () => {
    sts.on(GetCallerIdentityCommand).resolves({ Account: "000000000000" });
    const result = await checkHealth();
    expect(result.connected).toBe(true);
    expect(result.account).toBe("000000000000");
  });

  it("reports disconnected on connection failure", async () => {
    sts.on(GetCallerIdentityCommand).rejects(
      Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" }),
    );
    const result = await checkHealth();
    expect(result.connected).toBe(false);
    expect(result.account).toBeNull();
  });
});
