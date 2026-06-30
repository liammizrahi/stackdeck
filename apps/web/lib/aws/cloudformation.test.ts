import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { listStacks } from "@/lib/aws/cloudformation";

const cfn = mockClient(CloudFormationClient);

afterEach(() => cfn.reset());

describe("listStacks", () => {
  it("maps name and status and sorts by name", async () => {
    cfn.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: "zeta-stack",
          StackId: "arn:aws:cloudformation:us-east-1:123:stack/zeta-stack/2",
          StackStatus: "CREATE_COMPLETE",
          CreationTime: new Date("2024-01-02T00:00:00Z"),
        },
        {
          StackName: "alpha-stack",
          StackId: "arn:aws:cloudformation:us-east-1:123:stack/alpha-stack/1",
          StackStatus: "UPDATE_COMPLETE",
          CreationTime: new Date("2024-01-01T00:00:00Z"),
        },
      ],
    });
    const result = await listStacks();
    expect(result.map((s) => s.name)).toEqual(["alpha-stack", "zeta-stack"]);
    expect(result[0]?.status).toBe("UPDATE_COMPLETE");
    expect(result[1]?.status).toBe("CREATE_COMPLETE");
  });

  it("returns empty array when no stacks exist", async () => {
    cfn.on(DescribeStacksCommand).resolves({ Stacks: [] });
    const result = await listStacks();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    cfn
      .on(DescribeStacksCommand, { NextToken: undefined })
      .resolves({
        Stacks: [
          {
            StackName: "beta-stack",
            StackStatus: "CREATE_COMPLETE",
            CreationTime: new Date("2024-01-01T00:00:00Z"),
          },
        ],
        NextToken: "page2token",
      })
      .on(DescribeStacksCommand, { NextToken: "page2token" })
      .resolves({
        Stacks: [
          {
            StackName: "alpha-stack",
            StackStatus: "CREATE_COMPLETE",
            CreationTime: new Date("2024-01-01T00:00:00Z"),
          },
        ],
      });
    const result = await listStacks();
    expect(result.map((s) => s.name)).toEqual(["alpha-stack", "beta-stack"]);
  });
});
