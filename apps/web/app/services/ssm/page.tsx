import ParametersTable from "./ParametersTable";
import { listParameters } from "@/lib/aws/ssm";

export const dynamic = "force-dynamic";

export default async function SsmPage() {
  const parameters = await listParameters();
  return <ParametersTable parameters={parameters} />;
}
