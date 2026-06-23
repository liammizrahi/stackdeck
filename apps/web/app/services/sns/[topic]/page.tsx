import TopicDetail from "./TopicDetail";
import { listSubscriptions } from "@/lib/aws/sns";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ arn?: string }>;
}) {
  const { topic } = await params;
  const { arn = "" } = await searchParams;
  const name = decodeURIComponent(topic);
  const topicArn = decodeURIComponent(arn);

  let subscriptions: Awaited<ReturnType<typeof listSubscriptions>> = [];
  let subscriptionsError: string | undefined;

  try {
    subscriptions = await listSubscriptions(topicArn);
  } catch (err) {
    subscriptionsError = err instanceof Error ? err.message : String(err);
  }

  return (
    <TopicDetail
      name={name}
      arn={topicArn}
      subscriptions={subscriptions}
      subscriptionsError={subscriptionsError}
    />
  );
}
