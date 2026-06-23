"use server";

import { revalidatePath } from "next/cache";
import {
  type AwsSettings,
  resetAwsSettings,
  saveAwsSettings,
} from "@/lib/aws/config";

export async function saveSettingsAction(
  input: Partial<AwsSettings>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    saveAwsSettings(input);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function resetSettingsAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    resetAwsSettings();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
