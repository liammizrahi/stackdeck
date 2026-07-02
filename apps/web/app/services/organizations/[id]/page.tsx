import AccountDetail from "./AccountDetail";
import { getAccount } from "@/lib/aws/organizations";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountId = decodeURIComponent(id);
  const { account, error } = await getAccount(accountId);
  return <AccountDetail account={account ?? null} error={error ?? null} />;
}
