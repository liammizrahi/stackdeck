import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  GetQueueAttributesCommand,
  ListQueuesCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { listQueues } from "@/lib/aws/sqs";

const sqs = mockClient(SQSClient);

afterEach(() => sqs.reset());

describe("listQueues", () => {
  it("maps attributes and sorts queues by name", async () => {
    sqs.on(ListQueuesCommand).resolves({
      QueueUrls: [
        "https://sqs.us-east-1.amazonaws.com/123456789012/zebra-queue",
        "https://sqs.us-east-1.amazonaws.com/123456789012/alpha-queue",
      ],
    });
    sqs.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        QueueArn: "arn:aws:sqs:us-east-1:123456789012:alpha-queue",
        ApproximateNumberOfMessages: "5",
        ApproximateNumberOfMessagesNotVisible: "2",
        ApproximateNumberOfMessagesDelayed: "1",
        VisibilityTimeout: "30",
      },
    });
    const result = await listQueues();
    expect(result.map((q) => q.name)).toEqual(["alpha-queue", "zebra-queue"]);
    expect(result[0]?.visible).toBe(5);
    expect(result[0]?.inflight).toBe(2);
    expect(result[0]?.delayed).toBe(1);
    expect(result[0]?.visibilityTimeout).toBe(30);
  });

  it("returns empty array when no queues exist", async () => {
    sqs.on(ListQueuesCommand).resolves({ QueueUrls: [] });
    const result = await listQueues();
    expect(result).toEqual([]);
  });

  it("defaults numeric attrs to 0 when missing", async () => {
    sqs.on(ListQueuesCommand).resolves({
      QueueUrls: ["https://sqs.us-east-1.amazonaws.com/123/my-queue"],
    });
    sqs.on(GetQueueAttributesCommand).resolves({ Attributes: {} });
    const result = await listQueues();
    expect(result[0]?.visible).toBe(0);
    expect(result[0]?.inflight).toBe(0);
    expect(result[0]?.delayed).toBe(0);
    expect(result[0]?.visibilityTimeout).toBe(30);
  });
});
