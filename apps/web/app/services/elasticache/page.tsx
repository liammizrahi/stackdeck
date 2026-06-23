import ClustersTable from "./ClustersTable";
import { listClusters } from "@/lib/aws/elasticache";

export const dynamic = "force-dynamic";

export default async function ElastiCachePage() {
  const clusters = await listClusters();
  return <ClustersTable clusters={clusters} />;
}
