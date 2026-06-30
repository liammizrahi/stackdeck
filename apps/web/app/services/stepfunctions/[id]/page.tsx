import StateMachineDetail from "./StateMachineDetail";
import { getStateMachine } from "@/lib/aws/stepfunctions";

export const dynamic = "force-dynamic";

export default async function StateMachinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const arn = decodeURIComponent(id);
  const { machine, error } = await getStateMachine(arn);
  return (
    <StateMachineDetail machine={machine ?? null} error={error ?? null} />
  );
}
