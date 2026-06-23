import GroupDetail from "./GroupDetail";
import { listLogStreams } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function LogGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const name = decodeURIComponent(group);
  const streams = await listLogStreams(name);
  return <GroupDetail group={name} streams={streams} />;
}
