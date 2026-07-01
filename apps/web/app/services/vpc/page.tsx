import VpcsTable from "./VpcsTable";
import { listVpcs } from "@/lib/aws/vpc";

export const dynamic = "force-dynamic";

export default async function VpcPage() {
  const vpcs = await listVpcs();
  return <VpcsTable vpcs={vpcs} />;
}
