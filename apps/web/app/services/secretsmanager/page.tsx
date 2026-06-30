import SecretsTable from "./SecretsTable";
import { listSecrets } from "@/lib/aws/secretsmanager";

export const dynamic = "force-dynamic";

export default async function SecretsManagerPage() {
  const secrets = await listSecrets();
  return <SecretsTable secrets={secrets} />;
}
