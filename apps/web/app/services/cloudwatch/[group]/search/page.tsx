import GroupSearch from "./GroupSearch";
import { searchGroup } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function GroupSearchPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const name = decodeURIComponent(group);
  const events = await searchGroup(name, "");
  return <GroupSearch group={name} initialEvents={events} />;
}
