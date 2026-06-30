import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeStreamSummaryCommand,
  KinesisClient,
  ListStreamsCommand,
} from "@aws-sdk/client-kinesis";
import { listStreams } from "@/lib/aws/kinesis";

const kinesis = mockClient(KinesisClient);

afterEach(() => kinesis.reset());

describe("listStreams", () => {
  it("maps status/shardCount and sorts by name", async () => {
    kinesis.on(ListStreamsCommand).resolves({
      StreamNames: ["zeta-stream", "alpha-stream"],
      HasMoreStreams: false,
    });
    kinesis
      .on(DescribeStreamSummaryCommand, { StreamName: "zeta-stream" })
      .resolves({
        StreamDescriptionSummary: {
          StreamName: "zeta-stream",
          StreamARN: "arn:aws:kinesis:us-east-1:123456789012:stream/zeta-stream",
          StreamStatus: "ACTIVE",
          OpenShardCount: 4,
          RetentionPeriodHours: 24,
          StreamCreationTimestamp: new Date("2024-01-01T00:00:00Z"),
          EnhancedMonitoring: [],
        },
      })
      .on(DescribeStreamSummaryCommand, { StreamName: "alpha-stream" })
      .resolves({
        StreamDescriptionSummary: {
          StreamName: "alpha-stream",
          StreamARN:
            "arn:aws:kinesis:us-east-1:123456789012:stream/alpha-stream",
          StreamStatus: "CREATING",
          OpenShardCount: 1,
          RetentionPeriodHours: 48,
          StreamCreationTimestamp: new Date("2024-02-01T00:00:00Z"),
          EnhancedMonitoring: [],
        },
      });

    const result = await listStreams();
    expect(result.map((s) => s.name)).toEqual(["alpha-stream", "zeta-stream"]);
    expect(result[0]?.status).toBe("CREATING");
    expect(result[0]?.shardCount).toBe(1);
    expect(result[1]?.status).toBe("ACTIVE");
    expect(result[1]?.shardCount).toBe(4);
  });

  it("returns empty array when no streams exist", async () => {
    kinesis.on(ListStreamsCommand).resolves({
      StreamNames: [],
      HasMoreStreams: false,
    });
    const result = await listStreams();
    expect(result).toEqual([]);
  });
});
