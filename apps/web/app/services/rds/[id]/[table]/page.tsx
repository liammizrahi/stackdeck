import RowsExplorer from "./RowsExplorer";
import { getColumns, getPrimaryKey, getRows } from "@/lib/aws/rds-db";

export const dynamic = "force-dynamic";

export default async function RdsTablePage({
  params,
}: {
  params: Promise<{ id: string; table: string }>;
}) {
  const { id, table } = await params;
  const identifier = decodeURIComponent(id);
  const full = decodeURIComponent(table);
  const dot = full.indexOf(".");
  const schema = dot === -1 ? "public" : full.slice(0, dot);
  const name = dot === -1 ? full : full.slice(dot + 1);

  const [columns, primaryKey, rows] = await Promise.all([
    getColumns(identifier, schema, name),
    getPrimaryKey(identifier, schema, name),
    getRows(identifier, schema, name),
  ]);

  return (
    <RowsExplorer
      identifier={identifier}
      schema={schema}
      table={name}
      columns={columns}
      primaryKey={primaryKey}
      initial={rows}
    />
  );
}
