import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  GetBucketLocationCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { listBuckets, listObjects } from "@/lib/aws/s3";

const s3 = mockClient(S3Client);

afterEach(() => s3.reset());

describe("listBuckets", () => {
  it("maps, resolves region, and sorts buckets", async () => {
    s3.on(ListBucketsCommand).resolves({
      Buckets: [
        { Name: "zeta", CreationDate: new Date("2020-01-01") },
        { Name: "alpha", CreationDate: new Date("2021-01-01") },
      ],
    });
    s3.on(GetBucketLocationCommand).resolves({ LocationConstraint: "eu-west-1" });
    const result = await listBuckets();
    expect(result.map((b) => b.name)).toEqual(["alpha", "zeta"]);
    expect(result[0]?.region).toBe("eu-west-1");
    expect(result[0]?.arn).toBe("arn:aws:s3:::alpha");
    expect(result[0]?.creationDate).toBe(new Date("2021-01-01").toISOString());
  });

  it("defaults region to us-east-1 when unconstrained", async () => {
    s3.on(ListBucketsCommand).resolves({ Buckets: [{ Name: "b" }] });
    s3.on(GetBucketLocationCommand).resolves({});
    const result = await listBuckets();
    expect(result[0]?.region).toBe("us-east-1");
  });
});

describe("listObjects", () => {
  it("splits objects and prefixes and strips the prefix from names", async () => {
    s3.on(ListObjectsV2Command).resolves({
      Contents: [
        { Key: "logs/a.txt", Size: 10, LastModified: new Date("2022-01-01") },
      ],
      CommonPrefixes: [{ Prefix: "logs/sub/" }],
    });
    const result = await listObjects("bk", "logs/");
    expect(result.objects).toEqual([
      {
        key: "logs/a.txt",
        name: "a.txt",
        size: 10,
        lastModified: new Date("2022-01-01").toISOString(),
      },
    ]);
    expect(result.prefixes).toEqual(["logs/sub/"]);
  });
});
