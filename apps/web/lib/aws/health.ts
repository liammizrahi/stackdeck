import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { clientConfig, getAwsSettings } from "@/lib/aws/config";

export async function checkHealth(): Promise<{
  connected: boolean;
  account: string | null;
  endpoint: string;
  region: string;
  error?: string;
}> {
  const { endpoint, region } = getAwsSettings();
  const client = new STSClient(clientConfig());
  try {
    const out = await client.send(new GetCallerIdentityCommand({}));
    return { connected: true, account: out.Account ?? null, endpoint, region };
  } catch (err) {
    return {
      connected: false,
      account: null,
      endpoint,
      region,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
