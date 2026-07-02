import VaultsTable from "./VaultsTable";
import { listVaults } from "@/lib/aws/backup";

export const dynamic = "force-dynamic";

export default async function BackupPage() {
  const vaults = await listVaults();
  return <VaultsTable vaults={vaults} />;
}
