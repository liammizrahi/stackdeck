import TablesTable from "./TablesTable";
import { listTables } from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

export default async function DynamoDBPage() {
  const tables = await listTables();
  return <TablesTable tables={tables} />;
}
