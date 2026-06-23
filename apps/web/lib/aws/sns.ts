import {
  ListSubscriptionsByTopicCommand,
  ListTopicsCommand,
  PublishCommand,
  SNSClient,
} from "@aws-sdk/client-sns";
import { clientConfig } from "@/lib/aws/config";

export interface SnsTopic {
  arn: string;
  name: string;
}

export interface SnsSubscription {
  protocol: string;
  endpoint: string;
  subscriptionArn: string;
}

function snsClient() {
  return new SNSClient(clientConfig());
}

export async function listTopics(): Promise<SnsTopic[]> {
  const client = snsClient();
  const topics: SnsTopic[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListTopicsCommand({ NextToken: nextToken }),
    );
    for (const t of out.Topics ?? []) {
      const arn = t.TopicArn ?? "";
      const name = arn.split(":").pop() ?? arn;
      topics.push({ arn, name });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return topics.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listSubscriptions(
  arn: string,
): Promise<SnsSubscription[]> {
  const client = snsClient();
  const subscriptions: SnsSubscription[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListSubscriptionsByTopicCommand({
        TopicArn: arn,
        NextToken: nextToken,
      }),
    );
    for (const s of out.Subscriptions ?? []) {
      subscriptions.push({
        protocol: s.Protocol ?? "",
        endpoint: s.Endpoint ?? "",
        subscriptionArn: s.SubscriptionArn ?? "",
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return subscriptions;
}

export async function publish(
  arn: string,
  message: string,
): Promise<{ messageId: string }> {
  const client = snsClient();
  const out = await client.send(
    new PublishCommand({ TopicArn: arn, Message: message }),
  );
  return { messageId: out.MessageId ?? "" };
}
