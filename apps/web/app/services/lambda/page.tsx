import FunctionsTable from "./FunctionsTable";
import { listFunctions } from "@/lib/aws/lambda";

export const dynamic = "force-dynamic";

export default async function LambdaPage() {
  const functions = await listFunctions();
  return <FunctionsTable functions={functions} />;
}
