import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  ListTagsOfResourceCommand,
} from "@aws-sdk/client-dynamodb";
import { listTables } from "@/lib/aws/dynamodb";

const dynamo = mockClient(DynamoDBClient);

afterEach(() => dynamo.reset());

describe("listTables", () => {
  it("maps and sorts table names", async () => {
    dynamo.on(ListTablesCommand).resolves({
      TableNames: ["zeta-table", "alpha-table", "mango-table"],
    });
    dynamo.on(DescribeTableCommand).resolves({
      Table: { TableArn: "arn:aws:dynamodb:us-east-1:123:table/test" },
    });
    dynamo.on(ListTagsOfResourceCommand).resolves({ Tags: [] });
    const result = await listTables();
    expect(result.map((t) => t.name)).toEqual([
      "alpha-table",
      "mango-table",
      "zeta-table",
    ]);
  });

  it("returns empty array when no tables", async () => {
    dynamo.on(ListTablesCommand).resolves({ TableNames: [] });
    const result = await listTables();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    dynamo
      .on(ListTablesCommand, { ExclusiveStartTableName: undefined })
      .resolves({ TableNames: ["b-table"], LastEvaluatedTableName: "b-table" })
      .on(ListTablesCommand, { ExclusiveStartTableName: "b-table" })
      .resolves({ TableNames: ["a-table"] });
    dynamo.on(DescribeTableCommand).resolves({
      Table: { TableArn: "arn:aws:dynamodb:us-east-1:123:table/test" },
    });
    dynamo.on(ListTagsOfResourceCommand).resolves({ Tags: [] });
    const result = await listTables();
    expect(result.map((t) => t.name)).toEqual(["a-table", "b-table"]);
  });

  it("includes arn and tags in returned items", async () => {
    dynamo.on(ListTablesCommand).resolves({ TableNames: ["my-table"] });
    dynamo.on(DescribeTableCommand).resolves({
      Table: { TableArn: "arn:aws:dynamodb:us-east-1:123:table/my-table" },
    });
    dynamo.on(ListTagsOfResourceCommand).resolves({
      Tags: [{ Key: "env", Value: "prod" }],
    });
    const result = await listTables();
    expect(result[0]?.arn).toBe("arn:aws:dynamodb:us-east-1:123:table/my-table");
    expect(result[0]?.tags).toEqual([{ key: "env", value: "prod" }]);
  });
});
