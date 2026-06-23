import InstancesTable from "./InstancesTable";
import { listDbInstances } from "@/lib/aws/rds";

export const dynamic = "force-dynamic";

export default async function RdsPage() {
  const instances = await listDbInstances();
  return <InstancesTable instances={instances} />;
}
