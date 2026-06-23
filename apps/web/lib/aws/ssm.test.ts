import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  GetParametersByPathCommand,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { listParameters } from "@/lib/aws/ssm";

const ssm = mockClient(SSMClient);

afterEach(() => ssm.reset());

describe("listParameters", () => {
  it("maps and sorts parameters by name", async () => {
    ssm.on(GetParametersByPathCommand).resolves({
      Parameters: [
        {
          Name: "/z/param",
          Type: "String",
          Value: "z-value",
          Version: 2,
          LastModifiedDate: new Date("2023-06-01"),
        },
        {
          Name: "/a/param",
          Type: "SecureString",
          Value: "a-value",
          Version: 1,
          LastModifiedDate: new Date("2023-01-01"),
        },
      ],
    });

    const result = await listParameters();
    expect(result.map((p) => p.name)).toEqual(["/a/param", "/z/param"]);
    expect(result[0]?.type).toBe("SecureString");
    expect(result[0]?.value).toBe("a-value");
    expect(result[0]?.version).toBe(1);
    expect(result[0]?.lastModifiedDate).toBe(
      new Date("2023-01-01").toISOString(),
    );
  });

  it("handles null LastModifiedDate", async () => {
    ssm.on(GetParametersByPathCommand).resolves({
      Parameters: [
        {
          Name: "/test/param",
          Type: "String",
          Value: "hello",
          Version: 1,
        },
      ],
    });

    const result = await listParameters();
    expect(result[0]?.lastModifiedDate).toBeNull();
  });

  it("paginates using NextToken", async () => {
    ssm
      .on(GetParametersByPathCommand, { NextToken: undefined })
      .resolves({
        Parameters: [
          {
            Name: "/page1/param",
            Type: "String",
            Value: "v1",
            Version: 1,
            LastModifiedDate: new Date("2023-01-01"),
          },
        ],
        NextToken: "token-abc",
      });
    ssm
      .on(GetParametersByPathCommand, { NextToken: "token-abc" })
      .resolves({
        Parameters: [
          {
            Name: "/page2/param",
            Type: "String",
            Value: "v2",
            Version: 2,
            LastModifiedDate: new Date("2023-02-01"),
          },
        ],
      });

    const result = await listParameters();
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(["/page1/param", "/page2/param"]);
  });
});
