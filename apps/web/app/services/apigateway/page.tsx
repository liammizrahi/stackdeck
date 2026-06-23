import ApisTable from "./ApisTable";
import { listApis } from "@/lib/aws/apigateway";

export const dynamic = "force-dynamic";

export default async function ApiGatewayPage() {
  const apis = await listApis();
  return <ApisTable apis={apis} />;
}
