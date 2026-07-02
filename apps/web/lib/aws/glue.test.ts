import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { GetDatabasesCommand, GlueClient } from "@aws-sdk/client-glue";
import { listDatabases } from "@/lib/aws/glue";

const glue = mockClient(GlueClient);

afterEach(() => glue.reset());

describe("listDatabases", () => {
  it("maps name and location and sorts by name", async () => {
    glue.on(GetDatabasesCommand).resolves({
      DatabaseList: [
        { Name: "zeta", LocationUri: "s3://bucket/zeta" },
        { Name: "alpha", LocationUri: "s3://bucket/alpha" },
      ],
    });
    const result = await listDatabases();
    expect(result.map((d) => d.name)).toEqual(["alpha", "zeta"]);
    expect(result[0]?.name).toBe("alpha");
    expect(result[0]?.location).toBe("s3://bucket/alpha");
  });

  it("returns empty array when no databases exist", async () => {
    glue.on(GetDatabasesCommand).resolves({ DatabaseList: [] });
    const result = await listDatabases();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    glue
      .on(GetDatabasesCommand, { NextToken: undefined })
      .resolves({
        DatabaseList: [{ Name: "beta", LocationUri: "s3://bucket/beta" }],
        NextToken: "page2token",
      })
      .on(GetDatabasesCommand, { NextToken: "page2token" })
      .resolves({
        DatabaseList: [{ Name: "alpha", LocationUri: "s3://bucket/alpha" }],
      });
    const result = await listDatabases();
    expect(result.map((d) => d.name)).toEqual(["alpha", "beta"]);
  });
});
