"use server";

import { revalidatePath } from "next/cache";
import {
  type CreateDbInstanceInput,
  createDbInstance,
  deleteDbInstance,
} from "@/lib/aws/rds";

export async function deleteDbInstancesAction(
  identifiers: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    for (const id of identifiers) {
      await deleteDbInstance(id);
    }
    revalidatePath("/services/rds");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
import {
  type DbTable,
  type QueryResult,
  deleteRow,
  getRows,
  insertRow,
  listTables,
  runQuery,
  updateRow,
} from "@/lib/aws/rds-db";

export async function getRowsAction(
  identifier: string,
  schema: string,
  table: string,
): Promise<QueryResult> {
  return getRows(identifier, schema, table);
}

export async function insertRowAction(
  identifier: string,
  schema: string,
  table: string,
  values: Record<string, string>,
): Promise<QueryResult> {
  return insertRow(identifier, schema, table, values);
}

export async function updateRowAction(
  identifier: string,
  schema: string,
  table: string,
  key: Record<string, string>,
  values: Record<string, string>,
): Promise<QueryResult> {
  return updateRow(identifier, schema, table, key, values);
}

export async function deleteRowAction(
  identifier: string,
  schema: string,
  table: string,
  key: Record<string, string>,
): Promise<QueryResult> {
  return deleteRow(identifier, schema, table, key);
}

export async function createDbInstanceAction(
  input: CreateDbInstanceInput,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await createDbInstance(input);
    revalidatePath("/services/rds");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function runQueryAction(
  identifier: string,
  sql: string,
): Promise<QueryResult> {
  return runQuery(identifier, sql);
}

export async function listTablesAction(identifier: string): Promise<DbTable[]> {
  return listTables(identifier);
}
