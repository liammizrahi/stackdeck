import StacksTable from "./StacksTable";
import { listStacks } from "@/lib/aws/cloudformation";

export const dynamic = "force-dynamic";

export default async function CloudFormationPage() {
  const stacks = await listStacks();
  return <StacksTable stacks={stacks} />;
}
