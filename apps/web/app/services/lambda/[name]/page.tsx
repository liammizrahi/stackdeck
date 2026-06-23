import FunctionDetail from "./FunctionDetail";
import { getFunction } from "@/lib/aws/lambda";

export const dynamic = "force-dynamic";

export default async function LambdaFunctionPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const fnName = decodeURIComponent(name);
  const result = await getFunction(fnName);
  return <FunctionDetail result={result} />;
}
