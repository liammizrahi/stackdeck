import {
  GetFunctionConfigurationCommand,
  LambdaClient,
  ListFunctionsCommand,
} from "@aws-sdk/client-lambda";
import { clientConfig } from "@/lib/aws/config";

export interface LambdaFunction {
  name: string;
  runtime: string;
  memory: number;
  timeout: number;
  lastModified: string;
  description: string;
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
  const functions: LambdaFunction[] = [];
  let marker: string | undefined;

  do {
    const out = await client.send(
      new ListFunctionsCommand({ Marker: marker }),
    );
    for (const fn of out.Functions ?? []) {
      functions.push({
        name: fn.FunctionName ?? "",
        runtime: fn.Runtime ?? "",
        memory: fn.MemorySize ?? 0,
        timeout: fn.Timeout ?? 0,
        lastModified: fn.LastModified ?? "",
        description: fn.Description ?? "",
      });
    }
    marker = out.NextMarker;
  } while (marker);

  return functions.sort((a, b) => a.name.localeCompare(b.name));
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
