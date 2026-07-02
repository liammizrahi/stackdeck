import VaultDetail from "./VaultDetail";
import { getVault } from "@/lib/aws/backup";

export const dynamic = "force-dynamic";

export default async function BackupVaultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vaultName = decodeURIComponent(id);
  const { vault, error } = await getVault(vaultName);
  return <VaultDetail vault={vault ?? null} error={error ?? null} />;
}
