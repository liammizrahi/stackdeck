import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { clientConfig, getAwsSettings } from "@/lib/aws/config";

describe("getAwsSettings", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.AWS_ENDPOINT_URL;
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("returns documented defaults", () => {
    expect(getAwsSettings()).toEqual({
      endpoint: "http://localstack:4566",
      region: "us-east-1",
      accessKeyId: "test",
      secretAccessKey: "test",
    });
  });

  it("honors env overrides", () => {
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
    process.env.AWS_REGION = "eu-central-1";
    process.env.AWS_ACCESS_KEY_ID = "abc";
    process.env.AWS_SECRET_ACCESS_KEY = "xyz";
    expect(getAwsSettings()).toEqual({
      endpoint: "http://localhost:4566",
      region: "eu-central-1",
      accessKeyId: "abc",
      secretAccessKey: "xyz",
    });
  });
});

describe("clientConfig", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.AWS_ENDPOINT_URL;
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("maps default settings into client config shape", () => {
    const config = clientConfig();
    expect(config.endpoint).toBe("http://localstack:4566");
    expect(config.region).toBe("us-east-1");
    expect(config.credentials).toEqual({
      accessKeyId: "test",
      secretAccessKey: "test",
    });
    expect(config.requestHandler).toBeInstanceOf(NodeHttpHandler);
  });
});
