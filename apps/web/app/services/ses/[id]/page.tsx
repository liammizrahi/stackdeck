import IdentityDetail from "./IdentityDetail";
import { getIdentity } from "@/lib/aws/ses";

export const dynamic = "force-dynamic";

export default async function IdentityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  const { identity, error } = await getIdentity(name);
  return (
    <IdentityDetail identity={identity ?? null} error={error ?? null} />
  );
}
