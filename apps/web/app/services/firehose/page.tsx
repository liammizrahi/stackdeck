import StreamsTable from "./StreamsTable";
import { listDeliveryStreams } from "@/lib/aws/firehose";

export const dynamic = "force-dynamic";

export default async function FirehosePage() {
  const streams = await listDeliveryStreams();
  return <StreamsTable streams={streams} />;
}
