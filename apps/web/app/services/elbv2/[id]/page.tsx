import LoadBalancerDetail from "./LoadBalancerDetail";
import { getLoadBalancer } from "@/lib/aws/elbv2";

export const dynamic = "force-dynamic";

export default async function LoadBalancerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const arn = decodeURIComponent(id);
  const { loadBalancer, error } = await getLoadBalancer(arn);
  return (
    <LoadBalancerDetail
      loadBalancer={loadBalancer ?? null}
      error={error ?? null}
    />
  );
}
