import {
  AppSyncClient,
  GetGraphqlApiCommand,
  ListDataSourcesCommand,
  ListGraphqlApisCommand,
} from "@aws-sdk/client-appsync";
import { clientConfig } from "@/lib/aws/config";

export interface GraphqlApi {
  apiId: string;
  name: string;
  authenticationType: string;
  arn: string;
  endpoint: string;
}

export interface DataSource {
  name: string;
  type: string;
  description: string;
}

export interface GraphqlApiDetail extends GraphqlApi {
  dataSources: DataSource[];
}

function appsyncClient() {
  return new AppSyncClient(clientConfig());
}

export async function listApis(): Promise<GraphqlApi[]> {
  const client = appsyncClient();
  const apis: GraphqlApi[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListGraphqlApisCommand({ nextToken }),
    );
    for (const a of out.graphqlApis ?? []) {
      apis.push({
        apiId: a.apiId ?? "",
        name: a.name ?? "",
        authenticationType: a.authenticationType ?? "",
        arn: a.arn ?? "",
        endpoint: a.uris?.GRAPHQL ?? "",
      });
    }
    nextToken = out.nextToken;
  } while (nextToken);

  return apis.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getApi(
  apiId: string,
): Promise<{ api?: GraphqlApiDetail; error?: string }> {
  try {
    const client = appsyncClient();
    const out = await client.send(new GetGraphqlApiCommand({ apiId }));
    const g = out.graphqlApi;
    if (!g) return { error: "API not found" };

    const dataSources: DataSource[] = [];
    let nextToken: string | undefined;
    do {
      const dsOut = await client.send(
        new ListDataSourcesCommand({ apiId, nextToken }),
      );
      for (const d of dsOut.dataSources ?? []) {
        dataSources.push({
          name: d.name ?? "",
          type: d.type ?? "",
          description: d.description ?? "",
        });
      }
      nextToken = dsOut.nextToken;
    } while (nextToken);

    return {
      api: {
        apiId: g.apiId ?? apiId,
        name: g.name ?? "",
        authenticationType: g.authenticationType ?? "",
        arn: g.arn ?? "",
        endpoint: g.uris?.GRAPHQL ?? "",
        dataSources,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
