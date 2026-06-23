import DistributionDetail from "./DistributionDetail";
import { getDistribution } from "@/lib/aws/cloudfront";

export const dynamic = "force-dynamic";

export default async function DistributionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const distributionId = decodeURIComponent(id);
  const { distribution, error } = await getDistribution(distributionId);
  return (
    <DistributionDetail
      distribution={distribution ?? null}
      error={error ?? null}
    />
  );
}
