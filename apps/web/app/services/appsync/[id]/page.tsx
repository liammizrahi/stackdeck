import ApiDetail from "./ApiDetail";
import { getApi } from "@/lib/aws/appsync";

export const dynamic = "force-dynamic";

export default async function ApiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiId = decodeURIComponent(id);
  const { api, error } = await getApi(apiId);
  return <ApiDetail api={api ?? null} error={error ?? null} />;
}
