import BucketsTable from "./BucketsTable";
import { listBuckets } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

export default async function S3Page() {
  const buckets = await listBuckets();
  return <BucketsTable buckets={buckets} />;
}
