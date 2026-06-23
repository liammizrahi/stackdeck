import QueuesTable from "./QueuesTable";
import { listQueues } from "@/lib/aws/sqs";

export const dynamic = "force-dynamic";

export default async function SqsPage() {
  const queues = await listQueues();
  return <QueuesTable queues={queues} />;
}
