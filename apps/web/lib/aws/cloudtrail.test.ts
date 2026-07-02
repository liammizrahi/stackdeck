import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  CloudTrailClient,
  DescribeTrailsCommand,
} from "@aws-sdk/client-cloudtrail";
import { listTrails } from "@/lib/aws/cloudtrail";

const cloudtrail = mockClient(CloudTrailClient);

afterEach(() => cloudtrail.reset());

describe("listTrails", () => {
  it("maps trails and sorts by name", async () => {
    cloudtrail.on(DescribeTrailsCommand).resolves({
      trailList: [
        {
          Name: "zeta-trail",
          TrailARN: "arn:aws:cloudtrail:us-east-1:123456789012:trail/zeta-trail",
          S3BucketName: "zeta-bucket",
          HomeRegion: "us-east-1",
          IsMultiRegionTrail: true,
        },
        {
          Name: "alpha-trail",
          TrailARN:
            "arn:aws:cloudtrail:us-east-1:123456789012:trail/alpha-trail",
          S3BucketName: "alpha-bucket",
          HomeRegion: "us-west-2",
          IsMultiRegionTrail: false,
        },
      ],
    });
    const result = await listTrails();
    expect(result.map((t) => t.name)).toEqual(["alpha-trail", "zeta-trail"]);
    expect(result[0]?.s3Bucket).toBe("alpha-bucket");
  });

  it("returns empty array when no trails exist", async () => {
    cloudtrail.on(DescribeTrailsCommand).resolves({ trailList: [] });
    const result = await listTrails();
    expect(result).toEqual([]);
  });
});
