import TableDetail from "./TableDetail";
import { describeTable, listTableTags, scanItems } from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

export default async function DynamoTablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  const name = decodeURIComponent(table);
  const [detail, scan] = await Promise.all([describeTable(name), scanItems(name)]);
  const arn = "error" in detail ? "" : detail.arn;
  const tags = arn ? await listTableTags(arn) : [];
  return <TableDetail detail={detail} scan={scan} tableName={name} tags={tags} />;
}
