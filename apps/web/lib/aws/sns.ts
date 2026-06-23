import {
  ListSubscriptionsByTopicCommand,
  ListTagsForResourceCommand,
  ListTopicsCommand,
  PublishCommand,
  SNSClient,
} from "@aws-sdk/client-sns";
import { clientConfig } from "@/lib/aws/config";

export interface SnsTopicTag {
  key: string;
  value: string;
}

export interface SnsTopic {
  arn: string;
  name: string;
  tags: SnsTopicTag[];
}

export interface SnsSubscription {
  protocol: string;
  endpoint: string;
  subscriptionArn: string;
}

function snsClient() {
  return new SNSClient(clientConfig());
}

async function topicTags(client: SNSClient, arn: string): Promise<SnsTopicTag[]> {
  try {
    const out = await client.send(new ListTagsForResourceCommand({ ResourceArn: arn }));
    return (out.Tags ?? []).map((t) => ({ key: t.Key ?? "", value: t.Value ?? "" }));
  } catch {
    return [];
  }
}

export async function listTopics(): Promise<SnsTopic[]> {
  const client = snsClient();
  const rawTopics: { arn: string; name: string }[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListTopicsCommand({ NextToken: nextToken }),
    );
    for (const t of out.Topics ?? []) {
      const arn = t.TopicArn ?? "";
      const name = arn.split(":").pop() ?? arn;
      rawTopics.push({ arn, name });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  const topics = await Promise.all(
    rawTopics.map(async ({ arn, name }) => {
      const tags = await topicTags(client, arn);
      return { arn, name, tags };
    }),
  );

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
