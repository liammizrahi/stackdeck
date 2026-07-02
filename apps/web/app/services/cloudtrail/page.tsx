import TrailsTable from "./TrailsTable";
import { listTrails } from "@/lib/aws/cloudtrail";

export const dynamic = "force-dynamic";

export default async function CloudTrailPage() {
  const trails = await listTrails();
  return <TrailsTable trails={trails} />;
}
