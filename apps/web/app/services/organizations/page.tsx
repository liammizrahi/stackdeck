import AccountsTable from "./AccountsTable";
import { listAccounts } from "@/lib/aws/organizations";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const accounts = await listAccounts();
  return <AccountsTable accounts={accounts} />;
}
