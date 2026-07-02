import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeDeliveryStreamCommand,
  FirehoseClient,
  ListDeliveryStreamsCommand,
} from "@aws-sdk/client-firehose";
import { listDeliveryStreams } from "@/lib/aws/firehose";

const firehose = mockClient(FirehoseClient);

afterEach(() => firehose.reset());

describe("listDeliveryStreams", () => {
  it("maps status/type and sorts by name", async () => {
    firehose.on(ListDeliveryStreamsCommand).resolves({
      DeliveryStreamNames: ["zeta-stream", "alpha-stream"],
      HasMoreDeliveryStreams: false,
    });
    firehose
      .on(DescribeDeliveryStreamCommand, {
        DeliveryStreamName: "zeta-stream",
      })
      .resolves({
        DeliveryStreamDescription: {
          DeliveryStreamName: "zeta-stream",
          DeliveryStreamARN:
            "arn:aws:firehose:us-east-1:123456789012:deliverystream/zeta-stream",
          DeliveryStreamStatus: "ACTIVE",
          DeliveryStreamType: "DirectPut",
          VersionId: "1",
          CreateTimestamp: new Date("2024-01-01T00:00:00.000Z"),
          Destinations: [],
          HasMoreDestinations: false,
        },
      });
    firehose
      .on(DescribeDeliveryStreamCommand, {
        DeliveryStreamName: "alpha-stream",
      })
      .resolves({
        DeliveryStreamDescription: {
          DeliveryStreamName: "alpha-stream",
          DeliveryStreamARN:
            "arn:aws:firehose:us-east-1:123456789012:deliverystream/alpha-stream",
          DeliveryStreamStatus: "CREATING",
          DeliveryStreamType: "KinesisStreamAsSource",
          VersionId: "1",
          CreateTimestamp: new Date("2024-02-01T00:00:00.000Z"),
          Destinations: [],
          HasMoreDestinations: false,
        },
      });

    const result = await listDeliveryStreams();
    expect(result.map((s) => s.name)).toEqual(["alpha-stream", "zeta-stream"]);
    expect(result[0]?.status).toBe("CREATING");
    expect(result[0]?.type).toBe("KinesisStreamAsSource");
    expect(result[1]?.status).toBe("ACTIVE");
    expect(result[1]?.type).toBe("DirectPut");
  });

  it("returns empty array when no delivery streams exist", async () => {
    firehose.on(ListDeliveryStreamsCommand).resolves({
      DeliveryStreamNames: [],
      HasMoreDeliveryStreams: false,
    });
    const result = await listDeliveryStreams();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    firehose
      .on(ListDeliveryStreamsCommand, {
        ExclusiveStartDeliveryStreamName: undefined,
      })
      .resolves({
        DeliveryStreamNames: ["beta-stream"],
        HasMoreDeliveryStreams: true,
      })
      .on(ListDeliveryStreamsCommand, {
        ExclusiveStartDeliveryStreamName: "beta-stream",
      })
      .resolves({
        DeliveryStreamNames: ["alpha-stream"],
        HasMoreDeliveryStreams: false,
      });
    firehose.on(DescribeDeliveryStreamCommand).resolves({
      DeliveryStreamDescription: {
        DeliveryStreamName: "",
        DeliveryStreamARN: "",
        DeliveryStreamStatus: "ACTIVE",
        DeliveryStreamType: "DirectPut",
        VersionId: "1",
        Destinations: [],
        HasMoreDestinations: false,
      },
    });

    const result = await listDeliveryStreams();
    expect(result.map((s) => s.name)).toEqual(["alpha-stream", "beta-stream"]);
  });
});
