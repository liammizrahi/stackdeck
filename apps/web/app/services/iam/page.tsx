import { listUsers, listRoles, listPolicies } from "@/lib/aws/iam";
import IamView from "./IamView";

export const dynamic = "force-dynamic";

export default async function IamPage() {
  const [users, roles, policies] = await Promise.all([
    listUsers(),
    listRoles(),
    listPolicies(),
  ]);
  return <IamView users={users} roles={roles} policies={policies} />;
}
