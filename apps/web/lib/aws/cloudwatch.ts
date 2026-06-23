import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  FilterLogEventsCommand,
  GetLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { clientConfig } from "@/lib/aws/config";

export interface LogGroup {
  name: string;
  arn: string;
  storedBytes: number;
  retentionInDays: number | null;
  creationTime: string | null;
}

export interface LogStream {
  name: string;
  firstEventTime: string | null;
  lastEventTime: string | null;
  storedBytes: number;
}

export interface LogEvent {
  timestamp: string | null;
  epoch: number;
  message: string;
  logStreamName: string;
}

function cloudwatchClient() {
  return new CloudWatchLogsClient(clientConfig());
}

function isoOrNull(ms: number | undefined): string | null {
  return ms ? new Date(ms).toISOString() : null;
}

export async function listLogGroups(): Promise<LogGroup[]> {
  const client = cloudwatchClient();
  const out = await client.send(new DescribeLogGroupsCommand({ limit: 50 }));
  const groups = (out.logGroups ?? []).map((g) => ({
    name: g.logGroupName ?? "",
    arn: g.arn ?? "",
    storedBytes: g.storedBytes ?? 0,
    retentionInDays: g.retentionInDays ?? null,
    creationTime: isoOrNull(g.creationTime),
  }));
  return groups.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listLogStreams(group: string): Promise<LogStream[]> {
  const client = cloudwatchClient();
  try {
    const out = await client.send(
      new DescribeLogStreamsCommand({
        logGroupName: group,
        orderBy: "LastEventTime",
        descending: true,
        limit: 50,
      }),
    );
    return (out.logStreams ?? []).map((s) => ({
      name: s.logStreamName ?? "",
      firstEventTime: isoOrNull(s.firstEventTimestamp),
      lastEventTime: isoOrNull(s.lastEventTimestamp),
      storedBytes: s.storedBytes ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function searchGroup(
  group: string,
  pattern: string,
  startTime?: number,
): Promise<LogEvent[]> {
  const client = cloudwatchClient();
  try {
    const out = await client.send(
      new FilterLogEventsCommand({
        logGroupName: group,
        filterPattern: pattern || undefined,
        startTime: startTime || undefined,
        limit: 200,
      }),
    );
    return (out.events ?? []).map((e) => ({
      timestamp: isoOrNull(e.timestamp),
      epoch: e.timestamp ?? 0,
      message: e.message ?? "",
      logStreamName: e.logStreamName ?? "",
    }));
  } catch {
    return [];
  }
}

export async function searchAllGroups(
  pattern: string,
  startTime?: number,
): Promise<LogEvent[]> {
  const groups = await listLogGroups();
  const results = await Promise.all(
    groups.map((g) => searchGroup(g.name, pattern, startTime)),
  );
  return results
    .flat()
    .sort((a, b) => a.epoch - b.epoch)
    .slice(-500);
}

export async function getStreamEvents(
  group: string,
  stream: string,
  startTime?: number,
): Promise<LogEvent[]> {
  const client = cloudwatchClient();
  try {
    const out = await client.send(
      new GetLogEventsCommand({
        logGroupName: group,
        logStreamName: stream,
        startTime: startTime || undefined,
        startFromHead: true,
        limit: 1000,
      }),
    );
    return (out.events ?? []).map((e) => ({
      timestamp: isoOrNull(e.timestamp),
      epoch: e.timestamp ?? 0,
      message: e.message ?? "",
      logStreamName: stream,
    }));
  } catch {
    return [];
  }
}
