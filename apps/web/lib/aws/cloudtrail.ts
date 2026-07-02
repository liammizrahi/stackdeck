import {
  CloudTrailClient,
  DescribeTrailsCommand,
  GetTrailStatusCommand,
  LookupEventsCommand,
} from "@aws-sdk/client-cloudtrail";
import { clientConfig } from "@/lib/aws/config";

export interface Trail {
  name: string;
  arn: string;
  s3Bucket: string;
  homeRegion: string;
  isMultiRegion: boolean;
}

export interface TrailEvent {
  id: string;
  name: string;
  eventTime: string | null;
  username: string;
  eventSource: string;
}

export interface TrailDetail extends Trail {
  isLogging: boolean;
  logFileValidation: boolean;
  isOrganizationTrail: boolean;
  events: TrailEvent[];
}

function cloudtrailClient() {
  return new CloudTrailClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listTrails(): Promise<Trail[]> {
  const out = await cloudtrailClient().send(new DescribeTrailsCommand({}));
  return (out.trailList ?? [])
    .map((t) => ({
      name: t.Name ?? "",
      arn: t.TrailARN ?? "",
      s3Bucket: t.S3BucketName ?? "",
      homeRegion: t.HomeRegion ?? "",
      isMultiRegion: Boolean(t.IsMultiRegionTrail),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTrail(
  name: string,
): Promise<{ trail?: TrailDetail; error?: string }> {
  try {
    const out = await cloudtrailClient().send(
      new DescribeTrailsCommand({ trailNameList: [name] }),
    );
    const t = out.trailList?.[0];
    if (!t) return { error: "Trail not found" };

    let isLogging = false;
    try {
      const status = await cloudtrailClient().send(
        new GetTrailStatusCommand({ Name: name }),
      );
      isLogging = Boolean(status.IsLogging);
    } catch {
      isLogging = false;
    }

    let events: TrailEvent[] = [];
    try {
      const lookup = await cloudtrailClient().send(
        new LookupEventsCommand({ MaxResults: 25 }),
      );
      events = (lookup.Events ?? []).map((e) => ({
        id: e.EventId ?? "",
        name: e.EventName ?? "",
        eventTime: isoOrNull(e.EventTime),
        username: e.Username ?? "",
        eventSource: e.EventSource ?? "",
      }));
    } catch {
      events = [];
    }

    return {
      trail: {
        name: t.Name ?? name,
        arn: t.TrailARN ?? "",
        s3Bucket: t.S3BucketName ?? "",
        homeRegion: t.HomeRegion ?? "",
        isMultiRegion: Boolean(t.IsMultiRegionTrail),
        isLogging,
        logFileValidation: Boolean(t.LogFileValidationEnabled),
        isOrganizationTrail: Boolean(t.IsOrganizationTrail),
        events,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
