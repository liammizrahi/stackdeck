import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  AppSyncClient,
  ListGraphqlApisCommand,
} from "@aws-sdk/client-appsync";
import { listApis } from "@/lib/aws/appsync";

const appsync = mockClient(AppSyncClient);

afterEach(() => appsync.reset());

describe("listApis", () => {
  it("maps apiId, name, endpoint and sorts by name", async () => {
    appsync.on(ListGraphqlApisCommand).resolves({
      graphqlApis: [
        {
          apiId: "zeta-id",
          name: "zeta-api",
          authenticationType: "API_KEY",
          arn: "arn:aws:appsync:us-east-1:123456789012:apis/zeta-id",
          uris: { GRAPHQL: "https://zeta.appsync-api.us-east-1.amazonaws.com/graphql" },
        },
        {
          apiId: "alpha-id",
          name: "alpha-api",
          authenticationType: "AWS_IAM",
          arn: "arn:aws:appsync:us-east-1:123456789012:apis/alpha-id",
          uris: { GRAPHQL: "https://alpha.appsync-api.us-east-1.amazonaws.com/graphql" },
        },
      ],
    });
    const result = await listApis();
    expect(result.map((a) => a.name)).toEqual(["alpha-api", "zeta-api"]);
    expect(result[0]?.apiId).toBe("alpha-id");
    expect(result[0]?.endpoint).toBe(
      "https://alpha.appsync-api.us-east-1.amazonaws.com/graphql",
    );
  });

  it("returns empty array when no apis exist", async () => {
    appsync.on(ListGraphqlApisCommand).resolves({ graphqlApis: [] });
    const result = await listApis();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    appsync
      .on(ListGraphqlApisCommand, { nextToken: undefined })
      .resolves({
        graphqlApis: [{ apiId: "beta-id", name: "beta-api" }],
        nextToken: "page2token",
      })
      .on(ListGraphqlApisCommand, { nextToken: "page2token" })
      .resolves({
        graphqlApis: [{ apiId: "alpha-id", name: "alpha-api" }],
      });
    const result = await listApis();
    expect(result.map((a) => a.name)).toEqual(["alpha-api", "beta-api"]);
  });
});
