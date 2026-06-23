"use server";

import { publish } from "@/lib/aws/sns";

export async function publishAction(
  arn: string,
  message: string,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  try {
    const result = await publish(arn, message);
    return { ok: true, messageId: result.messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
