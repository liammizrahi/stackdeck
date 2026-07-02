import ApisTable from "./ApisTable";
import { listApis } from "@/lib/aws/appsync";

export const dynamic = "force-dynamic";

export default async function AppSyncPage() {
  const apis = await listApis();
  return <ApisTable apis={apis} />;
}
