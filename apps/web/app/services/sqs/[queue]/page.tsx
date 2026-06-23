import QueueDetail from "./QueueDetail";
import { listQueues, peekMessages } from "@/lib/aws/sqs";

export const dynamic = "force-dynamic";

export default async function QueuePage({
  params,
  searchParams,
}: {
  params: Promise<{ queue: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { queue } = await params;
  const { url } = await searchParams;
  const name = decodeURIComponent(queue);

  const queues = await listQueues();
  const queueData = queues.find((q) => q.name === name);

  const queueUrl = url ? decodeURIComponent(url) : (queueData?.url ?? "");

  const { messages, error: messagesError } = await peekMessages(queueUrl);

  return (
    <QueueDetail
      queue={queueData ?? { url: queueUrl, name, arn: "", visible: 0, inflight: 0, delayed: 0, visibilityTimeout: 30, tags: [] }}
      messages={messages ?? []}
      messagesError={messagesError}
    />
  );
}
