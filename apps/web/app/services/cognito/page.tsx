import UserPoolsTable from "./UserPoolsTable";
import { listUserPools } from "@/lib/aws/cognito";

export const dynamic = "force-dynamic";

export default async function CognitoPage() {
  const pools = await listUserPools();
  return <UserPoolsTable pools={pools} />;
}
