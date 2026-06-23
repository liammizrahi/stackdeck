import UserPoolDetail from "./UserPoolDetail";
import {
  getUserPool,
  listPoolClients,
  listPoolGroups,
  listPoolUsers,
} from "@/lib/aws/cognito";

export const dynamic = "force-dynamic";

export default async function UserPoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poolId = decodeURIComponent(id);
  const [{ pool, error }, users, groups, clients] = await Promise.all([
    getUserPool(poolId),
    listPoolUsers(poolId),
    listPoolGroups(poolId),
    listPoolClients(poolId),
  ]);
  return (
    <UserPoolDetail
      pool={pool ?? null}
      error={error ?? null}
      users={users}
      groups={groups}
      clients={clients}
    />
  );
}
