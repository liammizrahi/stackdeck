"use server";

import { revalidatePath } from "next/cache";
import {
  type BucketTag,
  createBucket,
  deleteBucket,
  getObjectPreview,
} from "@/lib/aws/s3";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface CreateBucketInput {
  name: string;
  region: string;
  tags: BucketTag[];
}

export async function createBucketAction(
  input: CreateBucketInput,
): Promise<ActionResult> {
  try {
    await createBucket(input.name.trim(), input.region, input.tags);
    revalidatePath("/services/s3");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteBucketsAction(names: string[]): Promise<ActionResult> {
  try {
    for (const name of names) {
      await deleteBucket(name);
    }
    revalidatePath("/services/s3");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function previewObjectAction(
  bucket: string,
  key: string,
): Promise<{ body?: string; error?: string }> {
  return getObjectPreview(bucket, key);
}
