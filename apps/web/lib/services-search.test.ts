import { describe, expect, it } from "vitest";
import { searchServices } from "@/lib/services-search";

describe("searchServices", () => {
  it("returns nothing for empty or whitespace queries", () => {
    expect(searchServices("")).toEqual([]);
    expect(searchServices("   ")).toEqual([]);
  });

  it("matches by name (case-insensitive)", () => {
    expect(searchServices("s3")[0]?.key).toBe("s3");
    expect(searchServices("LAMBDA")[0]?.key).toBe("lambda");
  });

  it("matches by alias", () => {
    expect(searchServices("nosql")[0]?.key).toBe("dynamodb");
    expect(searchServices("object storage")[0]?.key).toBe("s3");
    expect(searchServices("queue")[0]?.key).toBe("sqs");
    expect(searchServices("serverless")[0]?.key).toBe("lambda");
  });

  it("matches by description", () => {
    expect(searchServices("pub/sub").map((s) => s.key)).toContain("sns");
  });

  it("ranks a name prefix above an alias/description match", () => {
    // "s" prefixes S3, SQS, SNS, SSM by name; those should come before
    // services that only match "s" inside an alias/description.
    const keys = searchServices("s").map((s) => s.key);
    expect(keys.indexOf("s3")).toBeLessThan(keys.indexOf("lambda"));
  });

  it("trims the query before matching", () => {
    expect(searchServices("  iam  ")[0]?.key).toBe("iam");
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchServices("zzzznomatch")).toEqual([]);
  });
});
