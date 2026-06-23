import LogEventsTable from "./LogEventsTable";
import { getLogEvents } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function LogGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupName = decodeURIComponent(group);
  const events = await getLogEvents(groupName);
  return <LogEventsTable groupName={groupName} events={events} />;
}
