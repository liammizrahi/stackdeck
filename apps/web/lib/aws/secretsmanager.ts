import {
  DescribeSecretCommand,
  GetSecretValueCommand,
  ListSecretsCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { clientConfig } from "@/lib/aws/config";

export interface SecretSummary {
  name: string;
  arn: string;
  description: string;
  lastChangedDate: string | null;
  lastAccessedDate: string | null;
}

export interface SecretTag {
  key: string;
  value: string;
}

export interface SecretDetail extends SecretSummary {
  createdDate: string | null;
  rotationEnabled: boolean;
  tags: SecretTag[];
  value: string | null;
  valueError: string | null;
}

function secretsManagerClient() {
  return new SecretsManagerClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listSecrets(): Promise<SecretSummary[]> {
  const client = secretsManagerClient();
  const secrets: SecretSummary[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListSecretsCommand({ NextToken: nextToken }),
    );
    for (const s of out.SecretList ?? []) {
      secrets.push({
        name: s.Name ?? "",
        arn: s.ARN ?? "",
        description: s.Description ?? "",
        lastChangedDate: isoOrNull(s.LastChangedDate),
        lastAccessedDate: isoOrNull(s.LastAccessedDate),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return secrets.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSecret(
  id: string,
): Promise<{ secret?: SecretDetail; error?: string }> {
  const client = secretsManagerClient();

  let described;
  try {
    described = await client.send(
      new DescribeSecretCommand({ SecretId: id }),
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }

  let value: string | null = null;
  let valueError: string | null = null;
  try {
    const valueOut = await client.send(
      new GetSecretValueCommand({ SecretId: id }),
    );
    value = valueOut.SecretString ?? null;
  } catch (err) {
    value = null;
    valueError = err instanceof Error ? err.message : String(err);
  }

  const tags: SecretTag[] = (described.Tags ?? []).map((t) => ({
    key: t.Key ?? "",
    value: t.Value ?? "",
  }));

  return {
    secret: {
      name: described.Name ?? id,
      arn: described.ARN ?? "",
      description: described.Description ?? "",
      lastChangedDate: isoOrNull(described.LastChangedDate),
      lastAccessedDate: isoOrNull(described.LastAccessedDate),
      createdDate: isoOrNull(described.CreatedDate),
      rotationEnabled: Boolean(described.RotationEnabled),
      tags,
      value,
      valueError,
    },
  };
}
