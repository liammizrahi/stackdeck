import StreamDetail from "./StreamDetail";
import { getStream } from "@/lib/aws/kinesis";

export const dynamic = "force-dynamic";

export default async function StreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const streamName = decodeURIComponent(id);
  const { stream, error } = await getStream(streamName);
  return <StreamDetail stream={stream ?? null} error={error ?? null} />;
}
