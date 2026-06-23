import InstanceDetail from "./InstanceDetail";
import { getDbInstance } from "@/lib/aws/rds";
import { listTables } from "@/lib/aws/rds-db";

export const dynamic = "force-dynamic";

export default async function RdsInstancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const identifier = decodeURIComponent(id);
  const { instance, error } = await getDbInstance(identifier);
  const tables = instance ? await listTables(identifier) : [];
  return (
    <InstanceDetail
      instance={instance ?? null}
      error={error ?? null}
      identifier={identifier}
      tables={tables}
    />
  );
}
