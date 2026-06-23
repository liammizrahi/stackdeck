import DistributionsTable from "./DistributionsTable";
import { listDistributions } from "@/lib/aws/cloudfront";

export const dynamic = "force-dynamic";

export default async function CloudFrontPage() {
  const distributions = await listDistributions();
  return <DistributionsTable distributions={distributions} />;
}
