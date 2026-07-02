import DatabaseDetail from "./DatabaseDetail";
import { getDatabase } from "@/lib/aws/glue";

export const dynamic = "force-dynamic";

export default async function DatabasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const databaseName = decodeURIComponent(id);
  const { detail, error } = await getDatabase(databaseName);
  return <DatabaseDetail detail={detail ?? null} error={error ?? null} />;
}
