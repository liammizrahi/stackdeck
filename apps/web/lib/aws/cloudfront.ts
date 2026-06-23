import {
  CloudFrontClient,
  GetDistributionCommand,
  ListDistributionsCommand,
} from "@aws-sdk/client-cloudfront";
import { clientConfig } from "@/lib/aws/config";

export interface Distribution {
  id: string;
  arn: string;
  domainName: string;
  status: string;
  enabled: boolean;
  comment: string;
  lastModified: string | null;
}

export interface Origin {
  id: string;
  domainName: string;
}

export interface Behavior {
  pathPattern: string;
  targetOriginId: string;
  viewerProtocolPolicy: string;
}

export interface DistributionDetail extends Distribution {
  origins: Origin[];
  behaviors: Behavior[];
}

function cloudfrontClient() {
  return new CloudFrontClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listDistributions(): Promise<Distribution[]> {
  const out = await cloudfrontClient().send(new ListDistributionsCommand({}));
  return (out.DistributionList?.Items ?? [])
    .map((d) => ({
      id: d.Id ?? "",
      arn: d.ARN ?? "",
      domainName: d.DomainName ?? "",
      status: d.Status ?? "",
      enabled: Boolean(d.Enabled),
      comment: d.Comment ?? "",
      lastModified: isoOrNull(d.LastModifiedTime),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function getDistribution(
  id: string,
): Promise<{ distribution?: DistributionDetail; error?: string }> {
  try {
    const out = await cloudfrontClient().send(
      new GetDistributionCommand({ Id: id }),
    );
    const d = out.Distribution;
    if (!d) return { error: "Distribution not found" };
    const cfg = d.DistributionConfig;
    const origins: Origin[] = (cfg?.Origins?.Items ?? []).map((o) => ({
      id: o.Id ?? "",
      domainName: o.DomainName ?? "",
    }));
    const defaultBehavior: Behavior = {
      pathPattern: "Default (*)",
      targetOriginId: cfg?.DefaultCacheBehavior?.TargetOriginId ?? "",
      viewerProtocolPolicy:
        cfg?.DefaultCacheBehavior?.ViewerProtocolPolicy ?? "",
    };
    const cacheBehaviors: Behavior[] = (cfg?.CacheBehaviors?.Items ?? []).map(
      (b) => ({
        pathPattern: b.PathPattern ?? "",
        targetOriginId: b.TargetOriginId ?? "",
        viewerProtocolPolicy: b.ViewerProtocolPolicy ?? "",
      }),
    );
    return {
      distribution: {
        id: d.Id ?? id,
        arn: d.ARN ?? "",
        domainName: d.DomainName ?? "",
        status: d.Status ?? "",
        enabled: Boolean(cfg?.Enabled),
        comment: cfg?.Comment ?? "",
        lastModified: isoOrNull(d.LastModifiedTime),
        origins,
        behaviors: [defaultBehavior, ...cacheBehaviors],
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
