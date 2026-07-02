import {
  DescribeDomainCommand,
  ListDomainNamesCommand,
  OpenSearchClient,
} from "@aws-sdk/client-opensearch";
import { clientConfig } from "@/lib/aws/config";

export interface OpenSearchDomain {
  name: string;
  arn: string;
  engineVersion: string;
  instanceType: string;
  instanceCount: number;
  processing: boolean;
}

export interface OpenSearchDomainDetail extends OpenSearchDomain {
  endpoint: string;
  volumeSize: number;
  zoneAwareness: boolean;
  dedicatedMaster: boolean;
}

function opensearchClient() {
  return new OpenSearchClient(clientConfig());
}

export async function listDomains(): Promise<OpenSearchDomain[]> {
  const client = opensearchClient();
  const out = await client.send(new ListDomainNamesCommand({}));
  const names = (out.DomainNames ?? [])
    .map((d) => d.DomainName ?? "")
    .filter((n) => n !== "");
  const domains = await Promise.all(
    names.map(async (name) => {
      const described = await client.send(
        new DescribeDomainCommand({ DomainName: name }),
      );
      const status = described.DomainStatus;
      return {
        name,
        arn: status?.ARN ?? "",
        engineVersion: status?.EngineVersion ?? "",
        instanceType: status?.ClusterConfig?.InstanceType ?? "",
        instanceCount: status?.ClusterConfig?.InstanceCount ?? 0,
        processing: Boolean(status?.Processing),
      };
    }),
  );
  return domains.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDomain(
  name: string,
): Promise<{ domain?: OpenSearchDomainDetail; error?: string }> {
  try {
    const out = await opensearchClient().send(
      new DescribeDomainCommand({ DomainName: name }),
    );
    const status = out.DomainStatus;
    if (!status) return { error: "Domain not found" };
    const endpoint =
      status.Endpoint ?? Object.values(status.Endpoints ?? {})[0] ?? "";
    return {
      domain: {
        name: status.DomainName ?? name,
        arn: status.ARN ?? "",
        engineVersion: status.EngineVersion ?? "",
        instanceType: status.ClusterConfig?.InstanceType ?? "",
        instanceCount: status.ClusterConfig?.InstanceCount ?? 0,
        processing: Boolean(status.Processing),
        endpoint,
        volumeSize: status.EBSOptions?.VolumeSize ?? 0,
        zoneAwareness: Boolean(status.ClusterConfig?.ZoneAwarenessEnabled),
        dedicatedMaster: Boolean(status.ClusterConfig?.DedicatedMasterEnabled),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
