import WorkGroupsTable from "./WorkGroupsTable";
import { listWorkGroups } from "@/lib/aws/athena";

export const dynamic = "force-dynamic";

export default async function AthenaPage() {
  const workGroups = await listWorkGroups();
  return <WorkGroupsTable workGroups={workGroups} />;
}
