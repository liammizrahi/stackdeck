import {
  ApiGatewayV2Client,
  GetApisCommand,
  GetRoutesCommand,
  GetStagesCommand,
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
  apiType: string;
  gatewayVersion: string;
  endpoint: string;
  createdDate: string | null;
  tags: ApiTag[];
}

export interface Route {
  routeKey: string;
  target: string;
  authorizationType: string;
}

export interface ApiStage {
  name: string;
  autoDeploy: boolean;
  description: string;
}

function apigatewayClient() {
  return new ApiGatewayV2Client(clientConfig());
}

function apiTypeFor(protocol: string): string {
  if (protocol === "HTTP") return "HTTP API";
  if (protocol === "WEBSOCKET") return "WebSocket API";
  return protocol || "API";
}

export async function listApis(): Promise<Api[]> {
  const client = apigatewayClient();
  const { region } = getAwsSettings();
  const out = await client.send(new GetApisCommand({}));
  const apis = (out.Items ?? []).map((item) => {
    const id = item.ApiId ?? "";
    const rawTags: Record<string, string> = item.Tags ?? {};
    const protocolType = item.ProtocolType ?? "";
    return {
      id,
      name: item.Name ?? "",
      arn: `arn:aws:apigateway:${region}::/apis/${id}`,
      protocolType,
      apiType: apiTypeFor(protocolType),
      gatewayVersion: "v2",
      endpoint: item.ApiEndpoint ?? "",
      createdDate: item.CreatedDate ? item.CreatedDate.toISOString() : null,
      tags: Object.entries(rawTags).map(([key, value]) => ({ key, value })),
    };
  });
  return apis.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStages(apiId: string): Promise<ApiStage[]> {
  try {
    const client = apigatewayClient();
    const out = await client.send(new GetStagesCommand({ ApiId: apiId }));
    return (out.Items ?? []).map((item) => ({
      name: item.StageName ?? "",
      autoDeploy: item.AutoDeploy ?? false,
      description: item.Description ?? "",
    }));
  } catch {
    return [];
  }
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
