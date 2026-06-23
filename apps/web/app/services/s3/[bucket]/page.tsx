import { listBuckets, listObjects } from "@/lib/aws/s3";
import BucketDetail from "./BucketDetail";

export const dynamic = "force-dynamic";

export default async function BucketPage({
  params,
  searchParams,
}: {
  params: Promise<{ bucket: string }>;
  searchParams: Promise<{ prefix?: string }>;
}) {
  const { bucket } = await params;
  const { prefix = "" } = await searchParams;
  const name = decodeURIComponent(bucket);

  const [buckets, { objects, prefixes }] = await Promise.all([
    listBuckets(),
    listObjects(name, prefix),
  ]);

  const meta = buckets.find((b) => b.name === name);

  return (
    <BucketDetail
      bucket={name}
      arn={meta?.arn ?? `arn:aws:s3:::${name}`}
      region={meta?.region ?? "us-east-1"}
      creationDate={meta?.creationDate ?? null}
      tags={meta?.tags ?? []}
      prefix={prefix}
      objects={objects}
      prefixes={prefixes}
    />
  );
}
