import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { clientConfig } from "@/lib/aws/config";

export interface LogGroup {
  name: string;
  arn: string;
  storedBytes: number;
  retentionInDays: number | null;
  creationTime: string | null;
}

export interface LogEvent {
  timestamp: string | null;
  message: string;
  logStreamName: string;
}

function cloudwatchClient() {
  return new CloudWatchLogsClient(clientConfig());
}

export async function listLogGroups(): Promise<LogGroup[]> {
  const client = cloudwatchClient();
  const out = await client.send(new DescribeLogGroupsCommand({ limit: 50 }));
  const groups = (out.logGroups ?? []).map((g) => ({
    name: g.logGroupName ?? "",
    arn: g.arn ?? "",
    storedBytes: g.storedBytes ?? 0,
    retentionInDays: g.retentionInDays ?? null,
    creationTime: g.creationTime ? new Date(g.creationTime).toISOString() : null,
  }));
  return groups.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLogEvents(group: string): Promise<LogEvent[]> {
  const client = cloudwatchClient();
  try {
    const out = await client.send(
      new FilterLogEventsCommand({ logGroupName: group, limit: 100 }),
    );
    return (out.events ?? []).map((e) => ({
      timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : null,
      message: e.message ?? "",
      logStreamName: e.logStreamName ?? "",
    }));
  } catch {
    return [];
  }
}
