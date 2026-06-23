import {
  ApiGatewayV2Client,
  GetApisCommand,
  GetRoutesCommand,
} from "@aws-sdk/client-apigatewayv2";
import { clientConfig } from "@/lib/aws/config";

export interface Api {
  id: string;
  name: string;
  protocolType: string;
  endpoint: string;
}

export interface Route {
  routeKey: string;
  target: string;
  authorizationType: string;
}

function apigatewayClient() {
  return new ApiGatewayV2Client(clientConfig());
}

export async function listApis(): Promise<Api[]> {
  const client = apigatewayClient();
  const out = await client.send(new GetApisCommand({}));
  const apis = (out.Items ?? []).map((item) => ({
    id: item.ApiId ?? "",
    name: item.Name ?? "",
    protocolType: item.ProtocolType ?? "",
    endpoint: item.ApiEndpoint ?? "",
  }));
  return apis.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRoutes(
  apiId: string,
): Promise<{ routes?: Route[]; error?: string }> {
  try {
    const client = apigatewayClient();
    const out = await client.send(new GetRoutesCommand({ ApiId: apiId }));
    const routes = (out.Items ?? []).map((item) => ({
      routeKey: item.RouteKey ?? "",
      target: item.Target ?? "",
      authorizationType: item.AuthorizationType ?? "",
    }));
    return { routes };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
