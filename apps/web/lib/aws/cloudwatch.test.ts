import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { listLogGroups, searchGroup } from "@/lib/aws/cloudwatch";

const cwl = mockClient(CloudWatchLogsClient);

afterEach(() => cwl.reset());

describe("listLogGroups", () => {
  it("maps and sorts log groups by name", async () => {
    cwl.on(DescribeLogGroupsCommand).resolves({
      logGroups: [
        {
          logGroupName: "/aws/lambda/z-function",
          arn: "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/z-function",
          storedBytes: 2048,
          retentionInDays: 30,
          creationTime: new Date("2023-06-01").getTime(),
        },
        {
          logGroupName: "/aws/lambda/a-function",
          arn: "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/a-function",
          storedBytes: 1024,
          retentionInDays: undefined,
          creationTime: new Date("2022-01-01").getTime(),
        },
      ],
    });
    const result = await listLogGroups();
    expect(result.map((g) => g.name)).toEqual([
      "/aws/lambda/a-function",
      "/aws/lambda/z-function",
    ]);
    expect(result[0]?.storedBytes).toBe(1024);
    expect(result[0]?.retentionInDays).toBeNull();
    expect(result[0]?.creationTime).toBe(new Date("2022-01-01").toISOString());
    expect(result[1]?.retentionInDays).toBe(30);
  });

  it("returns empty array when no log groups", async () => {
    cwl.on(DescribeLogGroupsCommand).resolves({ logGroups: [] });
    const result = await listLogGroups();
    expect(result).toEqual([]);
  });
});

describe("searchGroup", () => {
  it("maps events to serializable objects with epoch", async () => {
    const ms = new Date("2023-06-01T12:00:00Z").getTime();
    cwl.on(FilterLogEventsCommand).resolves({
      events: [
        { timestamp: ms, message: "Hello world", logStreamName: "stream-1" },
      ],
    });
    const result = await searchGroup("/aws/lambda/my-fn", "");
    expect(result).toEqual([
      {
        timestamp: new Date("2023-06-01T12:00:00Z").toISOString(),
        epoch: ms,
        message: "Hello world",
        logStreamName: "stream-1",
      },
    ]);
  });

  it("returns empty array on error", async () => {
    cwl.on(FilterLogEventsCommand).rejects(new Error("ResourceNotFoundException"));
    const result = await searchGroup("/nonexistent", "");
    expect(result).toEqual([]);
  });
});
