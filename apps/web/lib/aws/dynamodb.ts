import {
  DescribeTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  ListTagsOfResourceCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { clientConfig } from "@/lib/aws/config";

export interface DynamoTableTag {
  key: string;
  value: string;
}

export interface DynamoTable {
  name: string;
  arn: string;
  tags: DynamoTableTag[];
}

export interface TableKey {
  name: string;
  type: string;
}

export interface TableDetail {
  name: string;
  arn: string;
  status: string;
  itemCount: number;
  sizeBytes: number;
  keys: TableKey[];
}

export interface ScanResult {
  items: Record<string, unknown>[];
  columns: string[];
}

function dynamoClient() {
  return new DynamoDBClient(clientConfig());
}

export async function listTables(): Promise<DynamoTable[]> {
  const client = dynamoClient();
  const names: string[] = [];
  let lastKey: string | undefined;
  do {
    const out = await client.send(
      new ListTablesCommand({ ExclusiveStartTableName: lastKey }),
    );
    for (const n of out.TableNames ?? []) {
      names.push(n);
    }
    lastKey = out.LastEvaluatedTableName;
  } while (lastKey);
  const sorted = names.sort((a, b) => a.localeCompare(b));
  return Promise.all(
    sorted.map(async (n) => {
      let arn = "";
      let tags: DynamoTableTag[] = [];
      try {
        const descOut = await client.send(
          new DescribeTableCommand({ TableName: n }),
        );
        arn = descOut.Table?.TableArn ?? "";
      } catch {
        arn = "";
      }
      if (arn) {
        try {
          const tagsOut = await client.send(
            new ListTagsOfResourceCommand({ ResourceArn: arn }),
          );
          tags = (tagsOut.Tags ?? []).map((t) => ({
            key: t.Key ?? "",
            value: t.Value ?? "",
          }));
        } catch {
          tags = [];
        }
      }
      return { name: n, arn, tags };
    }),
  );
}

export async function describeTable(
  name: string,
): Promise<TableDetail | { error: string }> {
  try {
    const out = await dynamoClient().send(
      new DescribeTableCommand({ TableName: name }),
    );
    const table = out.Table;
    if (!table) return { error: "Table not found" };
    const keys: TableKey[] = (table.KeySchema ?? []).map((k) => ({
      name: k.AttributeName ?? "",
      type: k.KeyType ?? "",
    }));
    return {
      name: table.TableName ?? name,
      arn: table.TableArn ?? "",
      status: table.TableStatus ?? "UNKNOWN",
      itemCount: table.ItemCount ?? 0,
      sizeBytes: table.TableSizeBytes ?? 0,
      keys,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listTableTags(arn: string): Promise<DynamoTableTag[]> {
  try {
    const out = await dynamoClient().send(
      new ListTagsOfResourceCommand({ ResourceArn: arn }),
    );
    return (out.Tags ?? []).map((t) => ({ key: t.Key ?? "", value: t.Value ?? "" }));
  } catch {
    return [];
  }
}

export async function scanItems(name: string): Promise<ScanResult> {
  try {
    const out = await dynamoClient().send(
      new ScanCommand({ TableName: name, Limit: 50 }),
    );
    const items = (out.Items ?? []).map(
      (item) => unmarshall(item) as Record<string, unknown>,
    );
    const columnSet = new Set<string>();
    for (const item of items) {
      for (const key of Object.keys(item)) {
        columnSet.add(key);
      }
    }
    const columns = Array.from(columnSet).sort((a, b) => a.localeCompare(b));
    return { items, columns };
  } catch {
    return { items: [], columns: [] };
  }
}
