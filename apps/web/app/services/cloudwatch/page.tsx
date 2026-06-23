import LogGroupsTable from "./LogGroupsTable";
import { listLogGroups } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function CloudWatchPage() {
  const logGroups = await listLogGroups();
  return <LogGroupsTable logGroups={logGroups} />;
}
