import DatabasesTable from "./DatabasesTable";
import { listDatabases } from "@/lib/aws/glue";

export const dynamic = "force-dynamic";

export default async function GluePage() {
  const databases = await listDatabases();
  return <DatabasesTable databases={databases} />;
}
