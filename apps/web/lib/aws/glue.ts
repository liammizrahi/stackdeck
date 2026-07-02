import {
  GetDatabaseCommand,
  GetDatabasesCommand,
  GetTablesCommand,
  GlueClient,
} from "@aws-sdk/client-glue";
import { clientConfig } from "@/lib/aws/config";

export interface GlueDatabase {
  name: string;
  description: string;
  location: string;
  createTime: string | null;
}

export interface GlueTable {
  name: string;
  tableType: string;
  location: string;
  columnCount: number;
  createTime: string | null;
}

export interface DatabaseDetail {
  database: GlueDatabase;
  tables: GlueTable[];
}

function glueClient() {
  return new GlueClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listDatabases(): Promise<GlueDatabase[]> {
  const client = glueClient();
  const databases: GlueDatabase[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new GetDatabasesCommand({ NextToken: nextToken }),
    );
    for (const d of out.DatabaseList ?? []) {
      databases.push({
        name: d.Name ?? "",
        description: d.Description ?? "",
        location: d.LocationUri ?? "",
        createTime: isoOrNull(d.CreateTime),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return databases.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDatabase(
  name: string,
): Promise<{ detail?: DatabaseDetail; error?: string }> {
  const client = glueClient();
  try {
    const dbOut = await client.send(new GetDatabaseCommand({ Name: name }));
    const d = dbOut.Database;
    if (!d) return { error: "Database not found" };
    const database: GlueDatabase = {
      name: d.Name ?? name,
      description: d.Description ?? "",
      location: d.LocationUri ?? "",
      createTime: isoOrNull(d.CreateTime),
    };

    const tables: GlueTable[] = [];
    let nextToken: string | undefined;
    do {
      const out = await client.send(
        new GetTablesCommand({ DatabaseName: name, NextToken: nextToken }),
      );
      for (const t of out.TableList ?? []) {
        tables.push({
          name: t.Name ?? "",
          tableType: t.TableType ?? "",
          location: t.StorageDescriptor?.Location ?? "",
          columnCount: t.StorageDescriptor?.Columns?.length ?? 0,
          createTime: isoOrNull(t.CreateTime),
        });
      }
      nextToken = out.NextToken;
    } while (nextToken);

    return { detail: { database, tables } };
  } catch (err) {
    if (err instanceof Error && err.name.includes("EntityNotFound")) {
      return { error: "Database not found" };
    }
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
