import StateMachinesTable from "./StateMachinesTable";
import { listStateMachines } from "@/lib/aws/stepfunctions";

export const dynamic = "force-dynamic";

export default async function StepFunctionsPage() {
  const machines = await listStateMachines();
  return <StateMachinesTable machines={machines} />;
}
