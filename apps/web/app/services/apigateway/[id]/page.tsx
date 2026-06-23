import ApiDetail from "./ApiDetail";
import { listApis, getRoutes, getStages } from "@/lib/aws/apigateway";

export const dynamic = "force-dynamic";

export default async function ApiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiId = decodeURIComponent(id);
  const [apis, routesResult, stages] = await Promise.all([
    listApis(),
    getRoutes(apiId),
    getStages(apiId),
  ]);
  const api = apis.find((a) => a.id === apiId) ?? null;
  return (
    <ApiDetail
      api={api}
      apiId={apiId}
      routes={routesResult.routes ?? []}
      stages={stages}
      error={routesResult.error}
    />
  );
}
