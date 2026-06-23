import {
  GetParameterCommand,
  GetParametersByPathCommand,
  PutParameterCommand,
  SSMClient,
  type ParameterType,
} from "@aws-sdk/client-ssm";
import { clientConfig } from "@/lib/aws/config";

export interface Parameter {
  name: string;
  type: string;
  value: string;
  version: number;
  lastModifiedDate: string | null;
}

function ssmClient() {
  return new SSMClient(clientConfig());
}

export async function listParameters(): Promise<Parameter[]> {
  const client = ssmClient();
  const results: Parameter[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new GetParametersByPathCommand({
        Path: "/",
        Recursive: true,
        WithDecryption: true,
        NextToken: nextToken,
      }),
    );
    for (const p of out.Parameters ?? []) {
      results.push({
        name: p.Name ?? "",
        type: p.Type ?? "",
        value: p.Value ?? "",
        version: p.Version ?? 0,
        lastModifiedDate: p.LastModifiedDate
          ? p.LastModifiedDate.toISOString()
          : null,
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getParameter(
  name: string,
): Promise<{ name: string; value?: string; error?: string }> {
  try {
    const out = await ssmClient().send(
      new GetParameterCommand({ Name: name, WithDecryption: true }),
    );
    return { name, value: out.Parameter?.Value ?? "" };
  } catch (err) {
    return { name, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function putParameter(
  name: string,
  value: string,
  type: string,
): Promise<void> {
  await ssmClient().send(
    new PutParameterCommand({
      Name: name,
      Value: value,
      Type: type as ParameterType,
      Overwrite: true,
    }),
  );
}
