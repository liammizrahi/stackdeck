import {
  DescribeClustersCommand,
  DescribeServicesCommand,
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
} from "@aws-sdk/client-ecs";
import { clientConfig } from "@/lib/aws/config";

export interface Cluster {
  name: string;
  arn: string;
  status: string;
  runningTasks: number;
  pendingTasks: number;
  activeServices: number;
  containerInstances: number;
}

export interface Service {
  name: string;
  status: string;
  desiredCount: number;
  runningCount: number;
  pendingCount: number;
  launchType: string;
  taskDefinition: string;
}

export interface ClusterDetail extends Cluster {
  services: Service[];
}

function ecsClient() {
  return new ECSClient(clientConfig());
}

function nameFromArn(arn: string | undefined): string {
  return arn?.split("/").pop() ?? "";
}

export async function listClusters(): Promise<Cluster[]> {
  const client = ecsClient();
  const clusterArns: string[] = [];
  let nextToken: string | undefined;
  do {
    const out = await client.send(new ListClustersCommand({ nextToken }));
    clusterArns.push(...(out.clusterArns ?? []));
    nextToken = out.nextToken;
  } while (nextToken);

  if (clusterArns.length === 0) return [];

  const described = await client.send(
    new DescribeClustersCommand({ clusters: clusterArns }),
  );
  return (described.clusters ?? [])
    .map((c) => ({
      name: c.clusterName ?? nameFromArn(c.clusterArn),
      arn: c.clusterArn ?? "",
      status: c.status ?? "",
      runningTasks: c.runningTasksCount ?? 0,
      pendingTasks: c.pendingTasksCount ?? 0,
      activeServices: c.activeServicesCount ?? 0,
      containerInstances: c.registeredContainerInstancesCount ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCluster(
  name: string,
): Promise<{ cluster?: ClusterDetail; error?: string }> {
  try {
    const client = ecsClient();
    const described = await client.send(
      new DescribeClustersCommand({ clusters: [name] }),
    );
    const c = described.clusters?.[0];
    if (!c) return { error: "Cluster not found" };

    const serviceArns: string[] = [];
    let nextToken: string | undefined;
    do {
      const out = await client.send(
        new ListServicesCommand({ cluster: name, nextToken }),
      );
      serviceArns.push(...(out.serviceArns ?? []));
      nextToken = out.nextToken;
    } while (nextToken);

    const services: Service[] = [];
    for (let i = 0; i < serviceArns.length; i += 10) {
      const batch = serviceArns.slice(i, i + 10);
      const out = await client.send(
        new DescribeServicesCommand({ cluster: name, services: batch }),
      );
      for (const s of out.services ?? []) {
        services.push({
          name: s.serviceName ?? "",
          status: s.status ?? "",
          desiredCount: s.desiredCount ?? 0,
          runningCount: s.runningCount ?? 0,
          pendingCount: s.pendingCount ?? 0,
          launchType: s.launchType ?? "",
          taskDefinition: s.taskDefinition?.split("/").pop() ?? "",
        });
      }
    }

    return {
      cluster: {
        name: c.clusterName ?? nameFromArn(c.clusterArn),
        arn: c.clusterArn ?? "",
        status: c.status ?? "",
        runningTasks: c.runningTasksCount ?? 0,
        pendingTasks: c.pendingTasksCount ?? 0,
        activeServices: c.activeServicesCount ?? 0,
        containerInstances: c.registeredContainerInstancesCount ?? 0,
        services,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
