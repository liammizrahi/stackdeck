import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAwsSettings } from "@/lib/aws/config";

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
