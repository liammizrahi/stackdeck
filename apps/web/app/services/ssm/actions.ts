"use server";

import { getParameter, putParameter } from "@/lib/aws/ssm";

export async function viewParameterAction(
  name: string,
): Promise<{ value?: string; error?: string }> {
  try {
    const result = await getParameter(name);
    if (result.error) {
      return { error: result.error };
    }
    return { value: result.value };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function putParameterAction(
  name: string,
  value: string,
  type: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await putParameter(name, value, type);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
