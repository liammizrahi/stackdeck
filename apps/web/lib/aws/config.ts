import { readFileSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NodeHttpHandler } from "@smithy/node-http-handler";

export interface AwsSettings {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface ClientConfig {
  endpoint: string;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  requestHandler: NodeHttpHandler;
}

const requestTimeoutMs = 5000;

const defaults: AwsSettings = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  accessKeyId: "test",
  secretAccessKey: "test",
};

const settingsFile =
  process.env.STACKDECK_CONFIG_FILE ??
  path.join(os.tmpdir(), "stackdeck-settings.json");

function readStored(): Partial<AwsSettings> {
  if (process.env.NODE_ENV === "test") return {};
  try {
    return JSON.parse(readFileSync(settingsFile, "utf8")) as Partial<AwsSettings>;
  } catch {
    return {};
  }
}

export function getAwsSettings(): AwsSettings {
  const stored = readStored();
  return {
    endpoint:
      stored.endpoint || process.env.AWS_ENDPOINT_URL || defaults.endpoint,
    region: stored.region || process.env.AWS_REGION || defaults.region,
    accessKeyId:
      stored.accessKeyId ||
      process.env.AWS_ACCESS_KEY_ID ||
      defaults.accessKeyId,
    secretAccessKey:
      stored.secretAccessKey ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      defaults.secretAccessKey,
  };
}

export function saveAwsSettings(input: Partial<AwsSettings>): void {
  const next: Partial<AwsSettings> = {};
  if (input.endpoint?.trim()) next.endpoint = input.endpoint.trim();
  if (input.region?.trim()) next.region = input.region.trim();
  if (input.accessKeyId?.trim()) next.accessKeyId = input.accessKeyId.trim();
  if (input.secretAccessKey?.trim())
    next.secretAccessKey = input.secretAccessKey.trim();
  writeFileSync(settingsFile, JSON.stringify(next, null, 2));
}

export function resetAwsSettings(): void {
  try {
    rmSync(settingsFile);
  } catch {
    // nothing stored
  }
}

export function clientConfig(): ClientConfig {
  const settings = getAwsSettings();
  return {
    endpoint: settings.endpoint,
    region: settings.region,
    credentials: {
      accessKeyId: settings.accessKeyId,
      secretAccessKey: settings.secretAccessKey,
    },
    requestHandler: new NodeHttpHandler({
      connectionTimeout: requestTimeoutMs,
      requestTimeout: requestTimeoutMs,
    }),
  };
}
