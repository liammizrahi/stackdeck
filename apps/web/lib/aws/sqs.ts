import {
  GetQueueAttributesCommand,
  ListQueuesCommand,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { clientConfig } from "@/lib/aws/config";

export interface SqsQueue {
  url: string;
  name: string;
  arn: string;
  visible: number;
  inflight: number;
  delayed: number;
  visibilityTimeout: number;
}

export interface SqsMessage {
  messageId: string;
  body: string;
  sentTimestamp: string;
  receiveCount: number;
}

function sqsClient() {
  return new SQSClient(clientConfig());
}

export async function listQueues(): Promise<SqsQueue[]> {
  const client = sqsClient();
  const listOut = await client.send(new ListQueuesCommand({ MaxResults: 1000 }));
  const urls = listOut.QueueUrls ?? [];
  const queues = await Promise.all(
    urls.map(async (url) => {
      const attrOut = await client.send(
        new GetQueueAttributesCommand({
          QueueUrl: url,
          AttributeNames: ["All"],
        }),
      );
      const attrs = attrOut.Attributes ?? {};
      return {
        url,
        name: url.split("/").pop() ?? url,
        arn: attrs["QueueArn"] ?? "",
        visible: parseInt(attrs["ApproximateNumberOfMessages"] ?? "0", 10),
        inflight: parseInt(attrs["ApproximateNumberOfMessagesNotVisible"] ?? "0", 10),
        delayed: parseInt(attrs["ApproximateNumberOfMessagesDelayed"] ?? "0", 10),
        visibilityTimeout: parseInt(attrs["VisibilityTimeout"] ?? "30", 10),
      };
    }),
  );
  return queues.sort((a, b) => a.name.localeCompare(b.name));
}

export async function peekMessages(url: string): Promise<{ messages?: SqsMessage[]; error?: string }> {
  try {
    const client = sqsClient();
    const out = await client.send(
      new ReceiveMessageCommand({
        QueueUrl: url,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 0,
        WaitTimeSeconds: 0,
        MessageSystemAttributeNames: ["All"],
      }),
    );
    const messages = (out.Messages ?? []).map((m) => ({
      messageId: m.MessageId ?? "",
      body: m.Body ?? "",
      sentTimestamp: m.Attributes?.["SentTimestamp"]
        ? new Date(parseInt(m.Attributes["SentTimestamp"], 10)).toISOString()
        : "",
      receiveCount: parseInt(m.Attributes?.["ApproximateReceiveCount"] ?? "0", 10),
    }));
    return { messages };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function purgeQueueByUrl(url: string): Promise<void> {
  await sqsClient().send(new PurgeQueueCommand({ QueueUrl: url }));
}
