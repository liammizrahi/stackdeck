import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListTopicsCommand,
  SNSClient,
} from "@aws-sdk/client-sns";
import { listTopics } from "@/lib/aws/sns";

const sns = mockClient(SNSClient);

afterEach(() => sns.reset());

describe("listTopics", () => {
  it("maps topics, extracts name from arn, and sorts by name", async () => {
    sns.on(ListTopicsCommand).resolves({
      Topics: [
        { TopicArn: "arn:aws:sns:us-east-1:123456789012:zeta-topic" },
        { TopicArn: "arn:aws:sns:us-east-1:123456789012:alpha-topic" },
      ],
    });
    const result = await listTopics();
    expect(result.map((t) => t.name)).toEqual(["alpha-topic", "zeta-topic"]);
    expect(result[0]?.arn).toBe("arn:aws:sns:us-east-1:123456789012:alpha-topic");
    expect(result[0]?.name).toBe("alpha-topic");
  });

  it("returns empty array when no topics exist", async () => {
    sns.on(ListTopicsCommand).resolves({ Topics: [] });
    const result = await listTopics();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    sns
      .on(ListTopicsCommand, { NextToken: undefined })
      .resolves({
        Topics: [{ TopicArn: "arn:aws:sns:us-east-1:123:beta-topic" }],
        NextToken: "page2token",
      })
      .on(ListTopicsCommand, { NextToken: "page2token" })
      .resolves({
        Topics: [{ TopicArn: "arn:aws:sns:us-east-1:123:alpha-topic" }],
      });
    const result = await listTopics();
    expect(result.map((t) => t.name)).toEqual(["alpha-topic", "beta-topic"]);
  });
});
