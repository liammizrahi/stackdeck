import VpcDetail from "./VpcDetail";
import { getVpc } from "@/lib/aws/vpc";

export const dynamic = "force-dynamic";

export default async function VpcDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vpcId = decodeURIComponent(id);
  const { vpc, error } = await getVpc(vpcId);
  return <VpcDetail vpc={vpc ?? null} error={error ?? null} />;
}
