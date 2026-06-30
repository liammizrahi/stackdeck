import KeysTable from "./KeysTable";
import { listKeys } from "@/lib/aws/kms";

export const dynamic = "force-dynamic";

export default async function KmsPage() {
  const keys = await listKeys();
  return <KeysTable keys={keys} />;
}
