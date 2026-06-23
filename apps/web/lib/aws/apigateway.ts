import {
  ApiGatewayV2Client,
  GetApisCommand,
  GetRoutesCommand,
} from "@aws-sdk/client-apigatewayv2";
import { clientConfig, getAwsSettings } from "@/lib/aws/config";

export interface ApiTag {
  key: string;
  value: string;
}

export interface Api {
  id: string;
  name: string;
  arn: string;
  protocolType: string;
  endpoint: string;
  tags: ApiTag[];
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
  const { region } = getAwsSettings();
  const out = await client.send(new GetApisCommand({}));
  const apis = (out.Items ?? []).map((item) => {
    const id = item.ApiId ?? "";
    const rawTags: Record<string, string> = item.Tags ?? {};
    return {
      id,
      name: item.Name ?? "",
      arn: `arn:aws:apigateway:${region}::/apis/${id}`,
      protocolType: item.ProtocolType ?? "",
      endpoint: item.ApiEndpoint ?? "",
      tags: Object.entries(rawTags).map(([key, value]) => ({ key, value })),
    };
  });
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
