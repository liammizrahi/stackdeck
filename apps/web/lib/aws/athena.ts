import {
  AthenaClient,
  ListWorkGroupsCommand,
  GetWorkGroupCommand,
  ListNamedQueriesCommand,
  BatchGetNamedQueryCommand,
} from "@aws-sdk/client-athena";
import { clientConfig } from "@/lib/aws/config";

export interface WorkGroup {
  name: string;
  state: string;
  description: string;
  outputLocation: string;
  creationDate: string | null;
}

export interface NamedQuery {
  id: string;
  name: string;
  database: string;
  description: string;
  queryString: string;
}

function athenaClient() {
  return new AthenaClient(clientConfig());
}

function iso(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listWorkGroups(): Promise<WorkGroup[]> {
  const out = await athenaClient().send(new ListWorkGroupsCommand({}));
  return (out.WorkGroups ?? [])
    .map((wg) => ({
      name: wg.Name ?? "",
      state: wg.State ?? "",
      description: wg.Description ?? "",
      outputLocation: "",
      creationDate: iso(wg.CreationTime),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getWorkGroup(
  name: string,
): Promise<{ workGroup: WorkGroup } | { error: string }> {
  try {
    const out = await athenaClient().send(
      new GetWorkGroupCommand({ WorkGroup: name }),
    );
    const wg = out.WorkGroup;
    return {
      workGroup: {
        name: wg?.Name ?? "",
        state: wg?.State ?? "",
        description: wg?.Description ?? "",
        outputLocation:
          wg?.Configuration?.ResultConfiguration?.OutputLocation ?? "",
        creationDate: iso(wg?.CreationTime),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listNamedQueries(
  workGroup: string,
): Promise<NamedQuery[]> {
  try {
    const client = athenaClient();
    const listOut = await client.send(
      new ListNamedQueriesCommand({ WorkGroup: workGroup }),
    );
    const ids = listOut.NamedQueryIds ?? [];
    if (ids.length === 0) return [];
    const batchOut = await client.send(
      new BatchGetNamedQueryCommand({ NamedQueryIds: ids }),
    );
    return (batchOut.NamedQueries ?? []).map((q) => ({
      id: q.NamedQueryId ?? "",
      name: q.Name ?? "",
      database: q.Database ?? "",
      description: q.Description ?? "",
      queryString: q.QueryString ?? "",
    }));
  } catch {
    return [];
  }
}
