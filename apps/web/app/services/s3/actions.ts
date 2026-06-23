"use server";

import { revalidatePath } from "next/cache";
import { createBucket, deleteBucket, getObjectPreview } from "@/lib/aws/s3";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createBucketAction(name: string): Promise<ActionResult> {
  try {
    await createBucket(name.trim());
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
