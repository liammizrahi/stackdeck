import StackDetail from "./StackDetail";
import { getStack } from "@/lib/aws/cloudformation";

export const dynamic = "force-dynamic";

export default async function StackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stackName = decodeURIComponent(id);
  const { stack, error } = await getStack(stackName);
  return <StackDetail stack={stack ?? null} error={error ?? null} />;
}
