"use server";

import {
  type DbTable,
  type QueryResult,
  listTables,
  runQuery,
} from "@/lib/aws/rds-db";

export async function runQueryAction(
  identifier: string,
  sql: string,
): Promise<QueryResult> {
  return runQuery(identifier, sql);
}

export async function listTablesAction(identifier: string): Promise<DbTable[]> {
  return listTables(identifier);
}
