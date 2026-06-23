import {
  DescribeTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { clientConfig } from "@/lib/aws/config";

export interface DynamoTable {
  name: string;
}

export interface TableKey {
  name: string;
  type: string;
}

export interface TableDetail {
  name: string;
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
  return names
    .sort((a, b) => a.localeCompare(b))
    .map((n) => ({ name: n }));
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
      status: table.TableStatus ?? "UNKNOWN",
      itemCount: table.ItemCount ?? 0,
      sizeBytes: table.TableSizeBytes ?? 0,
      keys,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
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
