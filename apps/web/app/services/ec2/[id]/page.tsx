import InstanceDetail from "./InstanceDetail";
import { getInstance } from "@/lib/aws/ec2";

export const dynamic = "force-dynamic";

export default async function Ec2InstancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const instanceId = decodeURIComponent(id);
  const instance = await getInstance(instanceId);
  return <InstanceDetail instance={instance} />;
}
