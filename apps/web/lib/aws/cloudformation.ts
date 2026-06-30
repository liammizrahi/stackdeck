import {
  CloudFormationClient,
  DescribeStackEventsCommand,
  DescribeStacksCommand,
  ListStackResourcesCommand,
} from "@aws-sdk/client-cloudformation";
import { clientConfig } from "@/lib/aws/config";

export interface Stack {
  name: string;
  id: string;
  status: string;
  createdTime: string | null;
  updatedTime: string | null;
  description: string;
}

export interface StackResource {
  logicalId: string;
  physicalId: string;
  type: string;
  status: string;
  updatedTime: string | null;
}

export interface StackOutput {
  key: string;
  value: string;
  description: string;
}

export interface StackParameter {
  key: string;
  value: string;
}

export interface StackEvent {
  timestamp: string | null;
  logicalId: string;
  type: string;
  status: string;
  reason: string;
}

export interface StackDetail extends Stack {
  outputs: StackOutput[];
  parameters: StackParameter[];
  resources: StackResource[];
  events: StackEvent[];
}

function cloudformationClient() {
  return new CloudFormationClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listStacks(): Promise<Stack[]> {
  const client = cloudformationClient();
  const stacks: Stack[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new DescribeStacksCommand({ NextToken: nextToken }),
    );
    for (const s of out.Stacks ?? []) {
      stacks.push({
        name: s.StackName ?? "",
        id: s.StackId ?? "",
        status: s.StackStatus ?? "",
        createdTime: isoOrNull(s.CreationTime),
        updatedTime: isoOrNull(s.LastUpdatedTime),
        description: s.Description ?? "",
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return stacks.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStack(
  name: string,
): Promise<{ stack?: StackDetail; error?: string }> {
  try {
    const client = cloudformationClient();

    const describeOut = await client.send(
      new DescribeStacksCommand({ StackName: name }),
    );
    const s = describeOut.Stacks?.[0];
    if (!s) return { error: "Stack not found" };

    const outputs: StackOutput[] = (s.Outputs ?? []).map((o) => ({
      key: o.OutputKey ?? "",
      value: o.OutputValue ?? "",
      description: o.Description ?? "",
    }));

    const parameters: StackParameter[] = (s.Parameters ?? []).map((p) => ({
      key: p.ParameterKey ?? "",
      value: p.ParameterValue ?? "",
    }));

    const resources: StackResource[] = [];
    let resourcesToken: string | undefined;
    do {
      const resourcesOut = await client.send(
        new ListStackResourcesCommand({
          StackName: name,
          NextToken: resourcesToken,
        }),
      );
      for (const r of resourcesOut.StackResourceSummaries ?? []) {
        resources.push({
          logicalId: r.LogicalResourceId ?? "",
          physicalId: r.PhysicalResourceId ?? "",
          type: r.ResourceType ?? "",
          status: r.ResourceStatus ?? "",
          updatedTime: isoOrNull(r.LastUpdatedTimestamp),
        });
      }
      resourcesToken = resourcesOut.NextToken;
    } while (resourcesToken);

    const eventsOut = await client.send(
      new DescribeStackEventsCommand({ StackName: name }),
    );
    const events: StackEvent[] = (eventsOut.StackEvents ?? [])
      .slice(0, 50)
      .map((e) => ({
        timestamp: isoOrNull(e.Timestamp),
        logicalId: e.LogicalResourceId ?? "",
        type: e.ResourceType ?? "",
        status: e.ResourceStatus ?? "",
        reason: e.ResourceStatusReason ?? "",
      }));

    return {
      stack: {
        name: s.StackName ?? name,
        id: s.StackId ?? "",
        status: s.StackStatus ?? "",
        createdTime: isoOrNull(s.CreationTime),
        updatedTime: isoOrNull(s.LastUpdatedTime),
        description: s.Description ?? "",
        outputs,
        parameters,
        resources,
        events,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
