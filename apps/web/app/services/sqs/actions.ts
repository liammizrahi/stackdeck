"use server";

import { purgeQueueByUrl } from "@/lib/aws/sqs";

export async function purgeQueueAction(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await purgeQueueByUrl(url);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
