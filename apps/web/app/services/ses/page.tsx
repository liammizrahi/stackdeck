import IdentitiesTable from "./IdentitiesTable";
import { getAccount, listIdentities } from "@/lib/aws/ses";

export const dynamic = "force-dynamic";

export default async function SesPage() {
  const [identities, account] = await Promise.all([
    listIdentities(),
    getAccount(),
  ]);
  return <IdentitiesTable identities={identities} account={account} />;
}
