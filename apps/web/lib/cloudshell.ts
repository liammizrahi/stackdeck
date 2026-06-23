import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getAwsSettings } from "@/lib/aws/config";

const exec = promisify(execFile);

const commandTimeoutMs = 60_000;
const maxBuffer = 16 * 1024 * 1024;

export interface ShellResult {
  stdout: string;
  stderr: string;
  code: number;
}

export function shellEnv(): NodeJS.ProcessEnv {
  const settings = getAwsSettings();
  return {
    ...process.env,
    AWS_ENDPOINT_URL: settings.endpoint,
    AWS_REGION: settings.region,
    AWS_DEFAULT_REGION: settings.region,
    AWS_ACCESS_KEY_ID: settings.accessKeyId,
    AWS_SECRET_ACCESS_KEY: settings.secretAccessKey,
    AWS_PAGER: "",
  };
}

export async function runShell(command: string): Promise<ShellResult> {
  try {
    const { stdout, stderr } = await exec("/bin/sh", ["-c", command], {
      env: shellEnv(),
      timeout: commandTimeoutMs,
      maxBuffer,
    });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as {
      stdout?: string;
      stderr?: string;
      code?: number;
      message?: string;
      killed?: boolean;
    };
    if (e.killed) {
      return {
        stdout: e.stdout ?? "",
        stderr: `Command timed out after ${commandTimeoutMs / 1000}s`,
        code: 124,
      };
    }
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr || e.message || "Command failed",
      code: typeof e.code === "number" ? e.code : 1,
    };
  }
}
