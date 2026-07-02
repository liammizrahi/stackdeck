import StreamDetail from "./StreamDetail";
import { getDeliveryStream } from "@/lib/aws/firehose";

export const dynamic = "force-dynamic";

export default async function DeliveryStreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  const { stream, error } = await getDeliveryStream(name);
  return <StreamDetail stream={stream ?? null} error={error ?? null} />;
}
