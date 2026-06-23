import ClusterDetail from "./ClusterDetail";
import { getCluster } from "@/lib/aws/elasticache";

export const dynamic = "force-dynamic";

export default async function ElastiCacheClusterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clusterId = decodeURIComponent(id);
  const { cluster, error } = await getCluster(clusterId);
  return (
    <ClusterDetail cluster={cluster ?? null} error={error ?? null} />
  );
}
