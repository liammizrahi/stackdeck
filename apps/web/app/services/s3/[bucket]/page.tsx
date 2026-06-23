import ObjectsTable from "./ObjectsTable";
import { listObjects } from "@/lib/aws/s3";

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
  const { objects, prefixes } = await listObjects(name, prefix);
  return (
    <ObjectsTable
      bucket={name}
      prefix={prefix}
      objects={objects}
      prefixes={prefixes}
    />
  );
}
