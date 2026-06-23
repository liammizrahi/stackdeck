import WorkGroupDetail from "./WorkGroupDetail";
import { getWorkGroup, listNamedQueries } from "@/lib/aws/athena";

export const dynamic = "force-dynamic";

export default async function WorkGroupPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const [result, queries] = await Promise.all([
    getWorkGroup(decoded),
    listNamedQueries(decoded),
  ]);
  const workGroup = "workGroup" in result ? result.workGroup : null;
  const error = "error" in result ? result.error : null;
  return (
    <WorkGroupDetail
      workGroup={workGroup}
      error={error}
      queries={queries}
    />
  );
}
