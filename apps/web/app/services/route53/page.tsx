import HostedZonesTable from "./HostedZonesTable";
import { listHostedZones } from "@/lib/aws/route53";

export const dynamic = "force-dynamic";

export default async function Route53Page() {
  const zones = await listHostedZones();
  return <HostedZonesTable zones={zones} />;
}
