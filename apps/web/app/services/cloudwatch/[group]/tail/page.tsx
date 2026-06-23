import GroupTail from "./GroupTail";
import { searchGroup } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function GroupTailPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const name = decodeURIComponent(group);
  const events = await searchGroup(name, "");
  return <GroupTail group={name} initialEvents={events} />;
}
