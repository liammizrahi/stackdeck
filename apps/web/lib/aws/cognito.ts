import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
  ListGroupsCommand,
  ListUserPoolClientsCommand,
  ListUserPoolsCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { clientConfig, getAwsSettings } from "@/lib/aws/config";

export interface UserPool {
  id: string;
  name: string;
  arn: string;
  status: string;
  estimatedUsers: number | null;
  mfaConfiguration: string;
  creationDate: string | null;
  lastModifiedDate: string | null;
}

export interface PoolUser {
  username: string;
  status: string;
  enabled: boolean;
  email: string;
  created: string | null;
}

export interface PoolGroup {
  name: string;
  description: string;
  precedence: number | null;
}

export interface PoolClient {
  id: string;
  name: string;
}

function cognitoClient() {
  return new CognitoIdentityProviderClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listUserPools(): Promise<UserPool[]> {
  const client = cognitoClient();
  const { region } = getAwsSettings();
  const out = await client.send(new ListUserPoolsCommand({ MaxResults: 60 }));
  return (out.UserPools ?? [])
    .map((p) => ({
      id: p.Id ?? "",
      name: p.Name ?? "",
      arn: `arn:aws:cognito-idp:${region}:000000000000:userpool/${p.Id}`,
      status: p.Status ?? "",
      estimatedUsers: null,
      mfaConfiguration: "",
      creationDate: isoOrNull(p.CreationDate),
      lastModifiedDate: isoOrNull(p.LastModifiedDate),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getUserPool(
  id: string,
): Promise<{ pool?: UserPool; error?: string }> {
  try {
    const out = await cognitoClient().send(
      new DescribeUserPoolCommand({ UserPoolId: id }),
    );
    const p = out.UserPool;
    if (!p) return { error: "User pool not found" };
    return {
      pool: {
        id: p.Id ?? id,
        name: p.Name ?? "",
        arn: p.Arn ?? "",
        status: p.Status ?? "",
        estimatedUsers: p.EstimatedNumberOfUsers ?? null,
        mfaConfiguration: p.MfaConfiguration ?? "OFF",
        creationDate: isoOrNull(p.CreationDate),
        lastModifiedDate: isoOrNull(p.LastModifiedDate),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listPoolUsers(poolId: string): Promise<PoolUser[]> {
  try {
    const out = await cognitoClient().send(
      new ListUsersCommand({ UserPoolId: poolId, Limit: 60 }),
    );
    return (out.Users ?? []).map((u) => ({
      username: u.Username ?? "",
      status: u.UserStatus ?? "",
      enabled: u.Enabled ?? false,
      email:
        (u.Attributes ?? []).find((a) => a.Name === "email")?.Value ?? "",
      created: isoOrNull(u.UserCreateDate),
    }));
  } catch {
    return [];
  }
}

export async function listPoolGroups(poolId: string): Promise<PoolGroup[]> {
  try {
    const out = await cognitoClient().send(
      new ListGroupsCommand({ UserPoolId: poolId }),
    );
    return (out.Groups ?? []).map((g) => ({
      name: g.GroupName ?? "",
      description: g.Description ?? "",
      precedence: g.Precedence ?? null,
    }));
  } catch {
    return [];
  }
}

export async function listPoolClients(poolId: string): Promise<PoolClient[]> {
  try {
    const out = await cognitoClient().send(
      new ListUserPoolClientsCommand({ UserPoolId: poolId, MaxResults: 60 }),
    );
    return (out.UserPoolClients ?? []).map((c) => ({
      id: c.ClientId ?? "",
      name: c.ClientName ?? "",
    }));
  } catch {
    return [];
  }
}
