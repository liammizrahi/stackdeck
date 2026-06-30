import ClusterDetail from "./ClusterDetail";
import { getCluster } from "@/lib/aws/ecs";

export const dynamic = "force-dynamic";

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clusterName = decodeURIComponent(id);
  const { cluster, error } = await getCluster(clusterName);
  return (
    <ClusterDetail cluster={cluster ?? null} error={error ?? null} />
  );
}
