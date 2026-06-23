import GroupDetail from "./GroupDetail";
import { listLogStreams, searchGroup } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function LogGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const name = decodeURIComponent(group);
  const [streams, events] = await Promise.all([
    listLogStreams(name),
    searchGroup(name, ""),
  ]);
  return <GroupDetail group={name} streams={streams} initialEvents={events} />;
}
