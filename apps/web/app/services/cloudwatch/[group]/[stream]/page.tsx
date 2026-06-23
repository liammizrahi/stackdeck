import StreamViewer from "./StreamViewer";
import { getStreamEvents } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function LogStreamPage({
  params,
}: {
  params: Promise<{ group: string; stream: string }>;
}) {
  const { group, stream } = await params;
  const groupName = decodeURIComponent(group);
  const streamName = decodeURIComponent(stream);
  const events = await getStreamEvents(groupName, streamName);
  return (
    <StreamViewer
      group={groupName}
      stream={streamName}
      initialEvents={events}
    />
  );
}
