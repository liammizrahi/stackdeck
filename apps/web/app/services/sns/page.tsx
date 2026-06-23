import TopicsTable from "./TopicsTable";
import { listTopics } from "@/lib/aws/sns";

export const dynamic = "force-dynamic";

export default async function SnsPage() {
  const topics = await listTopics();
  return <TopicsTable topics={topics} />;
}
