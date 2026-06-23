import {
  ElastiCacheClient,
  DescribeCacheClustersCommand,
} from "@aws-sdk/client-elasticache";
import { clientConfig } from "@/lib/aws/config";

export interface CacheNode {
  id: string;
  status: string;
  endpoint: string;
}

export interface CacheCluster {
  id: string;
  engine: string;
  engineVersion: string;
  status: string;
  nodeType: string;
  numNodes: number | null;
  availabilityZone: string;
  endpoint: string;
  arn: string;
  created: string | null;
}

export interface CacheClusterDetail extends CacheCluster {
  nodes: CacheNode[];
}

function elasticacheClient() {
  return new ElastiCacheClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

function endpointStr(e?: { Address?: string; Port?: number }): string {
  if (!e?.Address) return "";
  return e.Port ? `${e.Address}:${e.Port}` : e.Address;
}

export async function listClusters(): Promise<CacheCluster[]> {
  const out = await elasticacheClient().send(
    new DescribeCacheClustersCommand({}),
  );
  return (out.CacheClusters ?? [])
    .map((c) => ({
      id: c.CacheClusterId ?? "",
      engine: c.Engine ?? "",
      engineVersion: c.EngineVersion ?? "",
      status: c.CacheClusterStatus ?? "",
      nodeType: c.CacheNodeType ?? "",
      numNodes: c.NumCacheNodes ?? null,
      availabilityZone: c.PreferredAvailabilityZone ?? "",
      endpoint: endpointStr(c.ConfigurationEndpoint),
      arn: c.ARN ?? "",
      created: isoOrNull(c.CacheClusterCreateTime),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function getCluster(
  id: string,
): Promise<{ cluster?: CacheClusterDetail; error?: string }> {
  try {
    const out = await elasticacheClient().send(
      new DescribeCacheClustersCommand({ CacheClusterId: id, ShowCacheNodeInfo: true }),
    );
    const c = out.CacheClusters?.[0];
    if (!c) return { error: "Cluster not found" };
    const nodes: CacheNode[] = (c.CacheNodes ?? []).map((n) => ({
      id: n.CacheNodeId ?? "",
      status: n.CacheNodeStatus ?? "",
      endpoint: endpointStr(n.Endpoint),
    }));
    return {
      cluster: {
        id: c.CacheClusterId ?? "",
        engine: c.Engine ?? "",
        engineVersion: c.EngineVersion ?? "",
        status: c.CacheClusterStatus ?? "",
        nodeType: c.CacheNodeType ?? "",
        numNodes: c.NumCacheNodes ?? null,
        availabilityZone: c.PreferredAvailabilityZone ?? "",
        endpoint: endpointStr(c.ConfigurationEndpoint),
        arn: c.ARN ?? "",
        created: isoOrNull(c.CacheClusterCreateTime),
        nodes,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
