import TrailDetail from "./TrailDetail";
import { getTrail } from "@/lib/aws/cloudtrail";

export const dynamic = "force-dynamic";

export default async function TrailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trailName = decodeURIComponent(id);
  const { trail, error } = await getTrail(trailName);
  return <TrailDetail trail={trail ?? null} error={error ?? null} />;
}
