import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeClustersCommand,
  ECSClient,
  ListClustersCommand,
} from "@aws-sdk/client-ecs";
import { listClusters } from "@/lib/aws/ecs";

const ecs = mockClient(ECSClient);

afterEach(() => ecs.reset());

describe("listClusters", () => {
  it("maps clusters and sorts by name", async () => {
    ecs.on(ListClustersCommand).resolves({
      clusterArns: [
        "arn:aws:ecs:us-east-1:123456789012:cluster/zeta",
        "arn:aws:ecs:us-east-1:123456789012:cluster/alpha",
      ],
    });
    ecs.on(DescribeClustersCommand).resolves({
      clusters: [
        {
          clusterName: "zeta",
          clusterArn: "arn:aws:ecs:us-east-1:123456789012:cluster/zeta",
          status: "ACTIVE",
          runningTasksCount: 5,
          pendingTasksCount: 1,
          activeServicesCount: 2,
          registeredContainerInstancesCount: 3,
        },
        {
          clusterName: "alpha",
          clusterArn: "arn:aws:ecs:us-east-1:123456789012:cluster/alpha",
          status: "INACTIVE",
          runningTasksCount: 0,
          pendingTasksCount: 0,
          activeServicesCount: 0,
          registeredContainerInstancesCount: 0,
        },
      ],
    });

    const result = await listClusters();
    expect(result.map((c) => c.name)).toEqual(["alpha", "zeta"]);
    expect(result[1]?.status).toBe("ACTIVE");
    expect(result[1]?.runningTasks).toBe(5);
  });

  it("returns empty array when no clusters exist", async () => {
    ecs.on(ListClustersCommand).resolves({ clusterArns: [] });
    const result = await listClusters();
    expect(result).toEqual([]);
  });
});
