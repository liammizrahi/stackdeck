import InstanceDetail from "./InstanceDetail";
import { getDbInstance } from "@/lib/aws/rds";

export const dynamic = "force-dynamic";

export default async function RdsInstancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const identifier = decodeURIComponent(id);
  const { instance, error } = await getDbInstance(identifier);
  return <InstanceDetail instance={instance ?? null} error={error ?? null} />;
}
