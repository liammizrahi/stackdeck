import HostedZoneDetail from "./HostedZoneDetail";
import { getHostedZone } from "@/lib/aws/route53";

export const dynamic = "force-dynamic";

export default async function HostedZonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const zoneId = decodeURIComponent(id);
  const { detail, error } = await getHostedZone(zoneId);
  return (
    <HostedZoneDetail detail={detail ?? null} error={error ?? null} />
  );
}
