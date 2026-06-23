import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import { listTables } from "@/lib/aws/dynamodb";

const dynamo = mockClient(DynamoDBClient);

afterEach(() => dynamo.reset());

describe("listTables", () => {
  it("maps and sorts table names", async () => {
    dynamo.on(ListTablesCommand).resolves({
      TableNames: ["zeta-table", "alpha-table", "mango-table"],
    });
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
    const result = await listTables();
    expect(result.map((t) => t.name)).toEqual(["a-table", "b-table"]);
  });
});
