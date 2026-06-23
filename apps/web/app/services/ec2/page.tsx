import InstancesTable from "./InstancesTable";
import { listInstances } from "@/lib/aws/ec2";

export const dynamic = "force-dynamic";

export default async function Ec2Page() {
  const instances = await listInstances();
  return <InstancesTable instances={instances} />;
}
