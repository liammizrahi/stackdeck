import {
  DescribeStreamCommand,
  DescribeStreamSummaryCommand,
  KinesisClient,
  ListStreamsCommand,
} from "@aws-sdk/client-kinesis";
import { clientConfig } from "@/lib/aws/config";

export interface KinesisStream {
  name: string;
  arn: string;
  status: string;
  shardCount: number;
  retentionHours: number;
  creationDate: string | null;
}

export interface Shard {
  shardId: string;
  startingHashKey: string;
  endingHashKey: string;
  startingSequenceNumber: string;
}

export interface StreamDetail extends KinesisStream {
  encryptionType: string;
  shards: Shard[];
}

function kinesisClient() {
  return new KinesisClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listStreams(): Promise<KinesisStream[]> {
  const client = kinesisClient();
  const names: string[] = [];
  let exclusiveStartStreamName: string | undefined;
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListStreamsCommand({
        ExclusiveStartStreamName: exclusiveStartStreamName,
        NextToken: nextToken,
      }),
    );
    names.push(...(out.StreamNames ?? []));
    if (out.NextToken) {
      nextToken = out.NextToken;
      exclusiveStartStreamName = undefined;
    } else if (out.HasMoreStreams) {
      nextToken = undefined;
      exclusiveStartStreamName = names[names.length - 1];
    } else {
      nextToken = undefined;
      exclusiveStartStreamName = undefined;
    }
  } while (nextToken || exclusiveStartStreamName);

  const streams = await Promise.all(
    names.map(async (name) => {
      const out = await client.send(
        new DescribeStreamSummaryCommand({ StreamName: name }),
      );
      const summary = out.StreamDescriptionSummary;
      return {
        name,
        arn: summary?.StreamARN ?? "",
        status: summary?.StreamStatus ?? "",
        shardCount: summary?.OpenShardCount ?? 0,
        retentionHours: summary?.RetentionPeriodHours ?? 0,
        creationDate: isoOrNull(summary?.StreamCreationTimestamp),
      };
    }),
  );

  return streams.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStream(
  name: string,
): Promise<{ stream?: StreamDetail; error?: string }> {
  try {
    const out = await kinesisClient().send(
      new DescribeStreamCommand({ StreamName: name }),
    );
    const d = out.StreamDescription;
    if (!d) return { error: "Stream not found" };
    const shards: Shard[] = (d.Shards ?? []).map((s) => ({
      shardId: s.ShardId ?? "",
      startingHashKey: s.HashKeyRange?.StartingHashKey ?? "",
      endingHashKey: s.HashKeyRange?.EndingHashKey ?? "",
      startingSequenceNumber:
        s.SequenceNumberRange?.StartingSequenceNumber ?? "",
    }));
    return {
      stream: {
        name: d.StreamName ?? name,
        arn: d.StreamARN ?? "",
        status: d.StreamStatus ?? "",
        shardCount: shards.length,
        retentionHours: d.RetentionPeriodHours ?? 0,
        creationDate: isoOrNull(d.StreamCreationTimestamp),
        encryptionType: d.EncryptionType ?? "",
        shards,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
