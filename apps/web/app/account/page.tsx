import AccountView from "./AccountView";
import {
  getAccountInformation,
  getContactInformation,
  listRegions,
} from "@/lib/aws/account";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const [{ info, error }, contact, regions] = await Promise.all([
    getAccountInformation(),
    getContactInformation(),
    listRegions(),
  ]);
  return (
    <AccountView
      info={info ?? null}
      error={error ?? null}
      contact={contact}
      regions={regions}
    />
  );
}
