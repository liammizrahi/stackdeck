import ClustersTable from "./ClustersTable";
import { listClusters } from "@/lib/aws/ecs";

export const dynamic = "force-dynamic";

export default async function EcsPage() {
  const clusters = await listClusters();
  return <ClustersTable clusters={clusters} />;
}
