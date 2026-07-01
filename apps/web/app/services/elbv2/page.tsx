import LoadBalancersTable from "./LoadBalancersTable";
import { listLoadBalancers } from "@/lib/aws/elbv2";

export const dynamic = "force-dynamic";

export default async function LoadBalancersPage() {
  const loadBalancers = await listLoadBalancers();
  return <LoadBalancersTable loadBalancers={loadBalancers} />;
}
