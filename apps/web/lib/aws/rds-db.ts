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

  const connection: DbConnection = {
    container,
    user: env.POSTGRES_USER ?? "postgres",
    password: env.POSTGRES_PASSWORD ?? "",
    database: env.POSTGRES_DB ?? env.POSTGRES_USER ?? "postgres",
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
  return ["SELECT", "WITH", "VALUES", "TABLE", "SHOW", "EXPLAIN"].includes(first);
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

  try {
    const { stdout } = await exec(
      "docker",
      [
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
      ],
      {
        env: { ...process.env, PGPASSWORD: conn.password },
        timeout: queryTimeoutMs,
        maxBuffer: 16 * 1024 * 1024,
      },
    );

    if (!isResultSetQuery(sql)) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        command: stdout.trim() || "OK",
      };
    }

    const parsed = parseCsv(stdout);
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

export async function listTables(identifier: string): Promise<DbTable[]> {
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
