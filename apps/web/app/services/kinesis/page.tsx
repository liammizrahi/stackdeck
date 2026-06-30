import StreamsTable from "./StreamsTable";
import { listStreams } from "@/lib/aws/kinesis";

export const dynamic = "force-dynamic";

export default async function KinesisPage() {
  const streams = await listStreams();
  return <StreamsTable streams={streams} />;
}
