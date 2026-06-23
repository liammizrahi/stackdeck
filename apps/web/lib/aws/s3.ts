import {
  type BucketLocationConstraint,
  CreateBucketCommand,
  DeleteBucketCommand,
  GetBucketLocationCommand,
  GetBucketTaggingCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutBucketTaggingCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { clientConfig } from "@/lib/aws/config";

export interface BucketTag {
  key: string;
  value: string;
}

export interface Bucket {
  name: string;
  arn: string;
  creationDate: string | null;
  region: string;
  tags: BucketTag[];
}

export interface S3Object {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
}

const previewLimit = 1024 * 1024;

function s3Client() {
  return new S3Client({ ...clientConfig(), forcePathStyle: true });
}

async function bucketRegion(client: S3Client, name: string): Promise<string> {
  try {
    const out = await client.send(
      new GetBucketLocationCommand({ Bucket: name }),
    );
    return out.LocationConstraint || "us-east-1";
  } catch {
    return "us-east-1";
  }
}

async function bucketTags(client: S3Client, name: string): Promise<BucketTag[]> {
  try {
    const out = await client.send(new GetBucketTaggingCommand({ Bucket: name }));
    return (out?.TagSet ?? []).map((t) => ({
      key: t.Key ?? "",
      value: t.Value ?? "",
    }));
  } catch {
    return [];
  }
}

export async function listBuckets(): Promise<Bucket[]> {
  const client = s3Client();
  const out = await client.send(new ListBucketsCommand({}));
  const buckets = await Promise.all(
    (out.Buckets ?? []).map(async (b) => {
      const name = b.Name ?? "";
      const [region, tags] = await Promise.all([
        bucketRegion(client, name),
        bucketTags(client, name),
      ]);
      return {
        name,
        arn: `arn:aws:s3:::${name}`,
        creationDate: b.CreationDate ? b.CreationDate.toISOString() : null,
        region,
        tags,
      };
    }),
  );
  return buckets.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listObjects(
  bucket: string,
  prefix: string,
): Promise<{ objects: S3Object[]; prefixes: string[] }> {
  const out = await s3Client().send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Delimiter: "/",
      Prefix: prefix || undefined,
      MaxKeys: 1000,
    }),
  );
  const objects = (out.Contents ?? [])
    .filter((c) => c.Key && c.Key !== prefix)
    .map((c) => ({
      key: c.Key ?? "",
      name: (c.Key ?? "").slice(prefix.length),
      size: c.Size ?? 0,
      lastModified: c.LastModified ? c.LastModified.toISOString() : null,
    }));
  const prefixes = (out.CommonPrefixes ?? []).map((p) => p.Prefix ?? "");
  return { objects, prefixes };
}

export async function getObjectPreview(
  bucket: string,
  key: string,
): Promise<{ body?: string; error?: string; truncated?: boolean }> {
  const client = s3Client();
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    if ((head.ContentLength ?? 0) > previewLimit) {
      return { error: "Object is larger than 1 MB and cannot be previewed." };
    }
    const out = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = (await out.Body?.transformToString()) ?? "";
    return { body };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createBucket(
  name: string,
  region?: string,
  tags?: BucketTag[],
): Promise<void> {
  const client = s3Client();
  await client.send(
    new CreateBucketCommand({
      Bucket: name,
      ...(region && region !== "us-east-1"
        ? {
            CreateBucketConfiguration: {
              LocationConstraint: region as BucketLocationConstraint,
            },
          }
        : {}),
    }),
  );
  if (tags && tags.length > 0) {
    await client.send(
      new PutBucketTaggingCommand({
        Bucket: name,
        Tagging: {
          TagSet: tags.map((t) => ({ Key: t.key, Value: t.value })),
        },
      }),
    );
  }
}

export async function deleteBucket(name: string): Promise<void> {
  await s3Client().send(new DeleteBucketCommand({ Bucket: name }));
}
