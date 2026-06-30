import {
  DescribeStateMachineCommand,
  ListExecutionsCommand,
  ListStateMachinesCommand,
  SFNClient,
} from "@aws-sdk/client-sfn";
import { clientConfig } from "@/lib/aws/config";

export interface StateMachine {
  arn: string;
  name: string;
  type: string;
  creationDate: string | null;
}

export interface Execution {
  executionArn: string;
  name: string;
  status: string;
  startDate: string | null;
  stopDate: string | null;
}

export interface StateMachineDetail extends StateMachine {
  status: string;
  roleArn: string;
  definition: string;
  executions: Execution[];
}

function sfnClient() {
  return new SFNClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listStateMachines(): Promise<StateMachine[]> {
  const client = sfnClient();
  const machines: StateMachine[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListStateMachinesCommand({ nextToken }),
    );
    for (const m of out.stateMachines ?? []) {
      machines.push({
        arn: m.stateMachineArn ?? "",
        name: m.name ?? "",
        type: m.type ?? "",
        creationDate: isoOrNull(m.creationDate),
      });
    }
    nextToken = out.nextToken;
  } while (nextToken);

  return machines.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStateMachine(
  arn: string,
): Promise<{ machine?: StateMachineDetail; error?: string }> {
  try {
    const client = sfnClient();
    const out = await client.send(
      new DescribeStateMachineCommand({ stateMachineArn: arn }),
    );

    const executions: Execution[] = [];
    let nextToken: string | undefined;
    do {
      const execOut = await client.send(
        new ListExecutionsCommand({ stateMachineArn: arn, nextToken }),
      );
      for (const e of execOut.executions ?? []) {
        executions.push({
          executionArn: e.executionArn ?? "",
          name: e.name ?? "",
          status: e.status ?? "",
          startDate: isoOrNull(e.startDate),
          stopDate: isoOrNull(e.stopDate),
        });
      }
      nextToken = execOut.nextToken;
    } while (nextToken);

    return {
      machine: {
        arn: out.stateMachineArn ?? arn,
        name: out.name ?? "",
        type: out.type ?? "",
        creationDate: isoOrNull(out.creationDate),
        status: out.status ?? "",
        roleArn: out.roleArn ?? "",
        definition: out.definition ?? "",
        executions,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
