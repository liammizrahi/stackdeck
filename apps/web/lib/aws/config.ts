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

export function getAwsSettings(): AwsSettings {
  return {
    endpoint: process.env.AWS_ENDPOINT_URL ?? "http://localstack:4566",
    region: process.env.AWS_REGION ?? "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
  };
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
