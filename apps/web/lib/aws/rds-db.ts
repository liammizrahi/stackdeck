import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const rowLimit = 1000;
const queryTimeoutMs = 30_000;

export interface QueryResult {
  columns: string[];
  rows: string[][];
  rowCount: number;
  command?: string;
  error?: string;
  truncated?: boolean;
}

export interface DbTable {
  schema: string;
  name: string;
  rows: number;
  size: number;
}

interface DbConnection {
  container: string;
  user: string;
  password: string;
  database: string;
  engine: string;
}

const connectionCache = new Map<string, DbConnection>();

async function resolveDbContainer(identifier: string): Promise<DbConnection> {
  const cached = connectionCache.get(identifier);
  if (cached) return cached;

  const { stdout: names } = await exec("docker", [
    "ps",
    "--filter",
    "label=ministack=rds",
    "--filter",
    `label=db_id=${identifier}`,
    "--format",
    "{{.Names}}",
  ]);
  const container = names.trim().split("\n")[0];
  if (!container) {
    throw new Error(
      `Database container not found for "${identifier}" — is MiniStack running?`,
    );
  }

  const { stdout: envOut } = await exec("docker", [
    "inspect",
    container,
    "--format",
    "{{range .Config.Env}}{{println .}}{{end}}",
  ]);
  const env: Record<string, string> = {};
  for (const line of envOut.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) env[line.slice(0, eq)] = line.slice(eq + 1);
  }

  const isMysql = Boolean(
    env.MYSQL_DATABASE ||
    env.MYSQL_USER ||
    env.MYSQL_ROOT_PASSWORD ||
    env.MARIADB_ROOT_PASSWORD,
  );

  const connection: DbConnection = {
    container,
    engine: isMysql ? "mysql" : "postgres",
    user: isMysql
      ? env.MYSQL_USER ?? "root"
      : env.POSTGRES_USER ?? "postgres",
    password: isMysql
      ? env.MYSQL_PASSWORD ?? env.MYSQL_ROOT_PASSWORD ?? ""
      : env.POSTGRES_PASSWORD ?? "",
    database: isMysql
      ? env.MYSQL_DATABASE ?? "mydb"
      : env.POSTGRES_DB ?? env.POSTGRES_USER ?? "postgres",
  };
  connectionCache.set(identifier, connection);
  return connection;
}

function isResultSetQuery(sql: string): boolean {
  let s = sql.trimStart();
  while (s.startsWith("--") || s.startsWith("/*")) {
    if (s.startsWith("--")) {
      const nl = s.indexOf("\n");
      s = nl === -1 ? "" : s.slice(nl + 1).trimStart();
    } else {
      const close = s.indexOf("*/");
      s = close === -1 ? "" : s.slice(close + 2).trimStart();
    }
  }
  const first = (s.match(/^[a-zA-Z]+/)?.[0] ?? "").toUpperCase();
  return ["SELECT", "WITH", "VALUES", "TABLE", "SHOW", "EXPLAIN", "DESCRIBE"].includes(first);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseTsv(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.split("\t"));
}

export async function runQuery(
  identifier: string,
  sql: string,
): Promise<QueryResult> {
  let conn: DbConnection;
  try {
    conn = await resolveDbContainer(identifier);
  } catch (err) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const isMysql = conn.engine === "mysql";

  const dockerArgs = isMysql
    ? [
      "exec",
      "-e",
      "MYSQL_PWD",
      conn.container,
      "mysql",
      "-u",
      conn.user,
      "-D",
      conn.database,
      "--batch",
      "--raw",
      "-e",
      sql,
    ]
    : [
      "exec",
      "-e",
      "PGPASSWORD",
      conn.container,
      "psql",
      "-U",
      conn.user,
      "-d",
      conn.database,
      "-v",
      "ON_ERROR_STOP=1",
      "--csv",
      "-c",
      sql,
    ];

  const envVars = isMysql
    ? { ...process.env, MYSQL_PWD: conn.password }
    : { ...process.env, PGPASSWORD: conn.password };

  try {
    const { stdout } = await exec("docker", dockerArgs, {
      env: envVars,
      timeout: queryTimeoutMs,
      maxBuffer: 16 * 1024 * 1024,
    });

    if (!isResultSetQuery(sql)) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        command: stdout.trim() || "OK",
      };
    }

    const parsed = isMysql ? parseTsv(stdout) : parseCsv(stdout);
    const columns = parsed.shift() ?? [];
    const truncated = parsed.length > rowLimit;
    const rows = truncated ? parsed.slice(0, rowLimit) : parsed;
    return { columns, rows, rowCount: rows.length, truncated };
  } catch (err) {
    const e = err as { stderr?: string; message?: string };
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      error: (e.stderr || e.message || String(err)).trim(),
    };
  }
}

export interface DbColumn {
  name: string;
  dataType: string;
  nullable: boolean;
}

function ident(name: string, isMysql = false): string {
  if (isMysql) {
    return `\`${name.replace(/`/g, "``")}\``;
  }
  return `"${name.replace(/"/g, '""')}"`;
}

function literal(value: string): string {
  return value === "" ? "NULL" : `'${value.replace(/'/g, "''")}'`;
}

function sqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export async function getColumns(
  identifier: string,
  schema: string,
  table: string,
): Promise<DbColumn[]> {
  const sql =
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns " +
    `WHERE table_schema = '${sqlString(schema)}' AND table_name = '${sqlString(table)}' ` +
    "ORDER BY ordinal_position";
  const result = await runQuery(identifier, sql);
  if (result.error) return [];
  const ci = result.columns.indexOf("column_name");
  const ti = result.columns.indexOf("data_type");
  const ni = result.columns.indexOf("is_nullable");
  return result.rows.map((r) => ({
    name: r[ci] ?? "",
    dataType: r[ti] ?? "",
    nullable: (r[ni] ?? "") === "YES",
  }));
}

export async function getPrimaryKey(
  identifier: string,
  schema: string,
  table: string,
): Promise<string[]> {
  const conn = await resolveDbContainer(identifier);
  if (conn.engine === "mysql") {
    const sql =
      `SELECT column_name FROM information_schema.key_column_usage ` +
      `WHERE table_schema = '${sqlString(schema)}' AND table_name = '${sqlString(table)}' ` +
      `AND constraint_name = 'PRIMARY'`;
    const result = await runQuery(identifier, sql);
    if (result.error) return [];
    return result.rows.map((r) => r[0] ?? "");
  }

  const rel = `${ident(schema)}.${ident(table)}`;
  const sql =
    "SELECT a.attname FROM pg_index i " +
    "JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) " +
    `WHERE i.indrelid = '${sqlString(rel)}'::regclass AND i.indisprimary`;
  const result = await runQuery(identifier, sql);
  if (result.error) return [];
  return result.rows.map((r) => r[0] ?? "");
}

export async function getRows(
  identifier: string,
  schema: string,
  table: string,
  limit = 200,
): Promise<QueryResult> {
  const conn = await resolveDbContainer(identifier);
  const isMysql = conn.engine === "mysql";
  const tableRef = isMysql
    ? `${ident(schema, true)}.${ident(table, true)}`
    : `${ident(schema)}.${ident(table)}`;
  return runQuery(identifier, `SELECT * FROM ${tableRef} LIMIT ${limit}`);
}

export async function insertRow(
  identifier: string,
  schema: string,
  table: string,
  values: Record<string, string>,
): Promise<QueryResult> {
  const conn = await resolveDbContainer(identifier);
  const isMysql = conn.engine === "mysql";
  const cols = Object.keys(values).filter((c) => values[c] !== "");
  if (cols.length === 0) {
    return { columns: [], rows: [], rowCount: 0, error: "No values provided." };
  }
  const tableRef = isMysql
    ? `${ident(schema, true)}.${ident(table, true)}`
    : `${ident(schema)}.${ident(table)}`;
  const colString = cols.map((c) => ident(c, isMysql)).join(", ");
  const sql =
    `INSERT INTO ${tableRef} ` +
    `(${colString}) VALUES ` +
    `(${cols.map((c) => literal(values[c] ?? "")).join(", ")})`;
  return runQuery(identifier, sql);
}

export async function updateRow(
  identifier: string,
  schema: string,
  table: string,
  key: Record<string, string>,
  values: Record<string, string>,
): Promise<QueryResult> {
  const conn = await resolveDbContainer(identifier);
  const isMysql = conn.engine === "mysql";
  const setCols = Object.keys(values);
  const whereCols = Object.keys(key);
  if (setCols.length === 0) {
    return { columns: [], rows: [], rowCount: 0, error: "No changes to apply." };
  }
  if (whereCols.length === 0) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      error: "Table has no primary key to identify the row.",
    };
  }
  const tableRef = isMysql
    ? `${ident(schema, true)}.${ident(table, true)}`
    : `${ident(schema)}.${ident(table)}`;
  const set = setCols
    .map((c) => `${ident(c, isMysql)} = ${literal(values[c] ?? "")}`)
    .join(", ");
  const where = whereCols
    .map((c) => `${ident(c, isMysql)} = ${literal(key[c] ?? "")}`)
    .join(" AND ");
  return runQuery(
    identifier,
    `UPDATE ${tableRef} SET ${set} WHERE ${where}`,
  );
}

export async function deleteRow(
  identifier: string,
  schema: string,
  table: string,
  key: Record<string, string>,
): Promise<QueryResult> {
  const conn = await resolveDbContainer(identifier);
  const isMysql = conn.engine === "mysql";
  const whereCols = Object.keys(key);
  if (whereCols.length === 0) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      error: "Table has no primary key to identify the row.",
    };
  }
  const tableRef = isMysql
    ? `${ident(schema, true)}.${ident(table, true)}`
    : `${ident(schema)}.${ident(table)}`;
  const where = whereCols
    .map((c) => `${ident(c, isMysql)} = ${literal(key[c] ?? "")}`)
    .join(" AND ");
  return runQuery(
    identifier,
    `DELETE FROM ${tableRef} WHERE ${where}`,
  );
}

export async function listTables(identifier: string): Promise<DbTable[]> {
  const conn = await resolveDbContainer(identifier);
  if (conn.engine === "mysql") {
    const sql =
      "SELECT table_schema AS `schema`, table_name AS `name`, " +
      "COALESCE(table_rows, 0) AS `rows`, " +
      "COALESCE(data_length + index_length, 0) AS `size` " +
      "FROM information_schema.tables " +
      `WHERE table_schema = '${sqlString(conn.database)}' ` +
      "ORDER BY table_name";
    const result = await runQuery(identifier, sql);
    if (result.error) return [];
    const si = result.columns.indexOf("schema");
    const ni = result.columns.indexOf("name");
    const ri = result.columns.indexOf("rows");
    const zi = result.columns.indexOf("size");
    return result.rows.map((r) => ({
      schema: r[si] ?? conn.database,
      name: r[ni] ?? "",
      rows: Number(r[ri] ?? 0),
      size: Number(r[zi] ?? 0),
    }));
  }

  const sql =
    "SELECT n.nspname AS schema, c.relname AS name, " +
    "COALESCE(s.n_live_tup, 0) AS rows, " +
    "pg_total_relation_size(c.oid) AS size " +
    "FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace " +
    "LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid " +
    "WHERE c.relkind = 'r' " +
    "AND n.nspname NOT IN ('pg_catalog', 'information_schema') " +
    "ORDER BY n.nspname, c.relname";
  const result = await runQuery(identifier, sql);
  if (result.error) return [];
  const si = result.columns.indexOf("schema");
  const ni = result.columns.indexOf("name");
  const ri = result.columns.indexOf("rows");
  const zi = result.columns.indexOf("size");
  return result.rows.map((r) => ({
    schema: r[si] ?? "",
    name: r[ni] ?? "",
    rows: Number(r[ri] ?? 0),
    size: Number(r[zi] ?? 0),
  }));
}