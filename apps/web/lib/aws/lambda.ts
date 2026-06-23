import {
  GetFunctionConfigurationCommand,
  LambdaClient,
  ListFunctionsCommand,
  ListTagsCommand,
} from "@aws-sdk/client-lambda";
import { clientConfig } from "@/lib/aws/config";

export interface LambdaFunctionTag {
  key: string;
  value: string;
}

export interface LambdaFunction {
  name: string;
  arn: string;
  runtime: string;
  memory: number;
  timeout: number;
  lastModified: string;
  description: string;
  tags: LambdaFunctionTag[];
}

export interface LambdaFunctionDetail {
  name: string;
  runtime: string;
  memory: number;
  timeout: number;
  handler: string;
  description: string;
  lastModified: string;
  codeSize: number;
  env: Record<string, string>;
}

function lambdaClient() {
  return new LambdaClient(clientConfig());
}

export async function listFunctions(): Promise<LambdaFunction[]> {
  const client = lambdaClient();
  const rawFunctions: { name: string; arn: string; runtime: string; memory: number; timeout: number; lastModified: string; description: string }[] = [];
  let marker: string | undefined;

  do {
    const out = await client.send(
      new ListFunctionsCommand({ Marker: marker }),
    );
    for (const fn of out.Functions ?? []) {
      rawFunctions.push({
        name: fn.FunctionName ?? "",
        arn: fn.FunctionArn ?? "",
        runtime: fn.Runtime ?? "",
        memory: fn.MemorySize ?? 0,
        timeout: fn.Timeout ?? 0,
        lastModified: fn.LastModified ?? "",
        description: fn.Description ?? "",
      });
    }
    marker = out.NextMarker;
  } while (marker);

  rawFunctions.sort((a, b) => a.name.localeCompare(b.name));

  const functions = await Promise.all(
    rawFunctions.map(async (fn) => {
      let tags: LambdaFunctionTag[] = [];
      try {
        const tagsOut = await client.send(new ListTagsCommand({ Resource: fn.arn }));
        tags = Object.entries(tagsOut.Tags ?? {}).map(([key, value]) => ({ key, value }));
      } catch {
        tags = [];
      }
      return { ...fn, tags };
    }),
  );

  return functions;
}

export async function getFunction(
  name: string,
): Promise<{ data?: LambdaFunctionDetail; error?: string }> {
  try {
    const out = await lambdaClient().send(
      new GetFunctionConfigurationCommand({ FunctionName: name }),
    );
    return {
      data: {
        name: out.FunctionName ?? "",
        runtime: out.Runtime ?? "",
        memory: out.MemorySize ?? 0,
        timeout: out.Timeout ?? 0,
        handler: out.Handler ?? "",
        description: out.Description ?? "",
        lastModified: out.LastModified ?? "",
        codeSize: out.CodeSize ?? 0,
        env: out.Environment?.Variables ?? {},
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
