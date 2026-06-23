import {
  IAMClient,
  ListUsersCommand,
  ListRolesCommand,
  ListPoliciesCommand,
} from "@aws-sdk/client-iam";
import { clientConfig } from "@/lib/aws/config";

export interface IamUser {
  name: string;
  id: string;
  arn: string;
  created: string | null;
}

export interface IamRole {
  name: string;
  id: string;
  arn: string;
  created: string | null;
  description: string;
}

export interface IamPolicy {
  name: string;
  id: string;
  arn: string;
  attachmentCount: number;
}

function iamClient() {
  return new IAMClient(clientConfig());
}

export async function listUsers(): Promise<IamUser[]> {
  const client = iamClient();
  const users: IamUser[] = [];
  let marker: string | undefined;
  do {
    const out = await client.send(
      new ListUsersCommand({ Marker: marker }),
    );
    for (const u of out.Users ?? []) {
      users.push({
        name: u.UserName ?? "",
        id: u.UserId ?? "",
        arn: u.Arn ?? "",
        created: u.CreateDate ? u.CreateDate.toISOString() : null,
      });
    }
    marker = out.IsTruncated ? out.Marker : undefined;
  } while (marker);
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listRoles(): Promise<IamRole[]> {
  const client = iamClient();
  const roles: IamRole[] = [];
  let marker: string | undefined;
  do {
    const out = await client.send(
      new ListRolesCommand({ Marker: marker }),
    );
    for (const r of out.Roles ?? []) {
      roles.push({
        name: r.RoleName ?? "",
        id: r.RoleId ?? "",
        arn: r.Arn ?? "",
        created: r.CreateDate ? r.CreateDate.toISOString() : null,
        description: r.Description ?? "",
      });
    }
    marker = out.IsTruncated ? out.Marker : undefined;
  } while (marker);
  return roles.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listPolicies(): Promise<IamPolicy[]> {
  const client = iamClient();
  const policies: IamPolicy[] = [];
  let marker: string | undefined;
  do {
    const out = await client.send(
      new ListPoliciesCommand({ Scope: "Local", Marker: marker }),
    );
    for (const p of out.Policies ?? []) {
      policies.push({
        name: p.PolicyName ?? "",
        id: p.PolicyId ?? "",
        arn: p.Arn ?? "",
        attachmentCount: p.AttachmentCount ?? 0,
      });
    }
    marker = out.IsTruncated ? out.Marker : undefined;
  } while (marker);
  return policies.sort((a, b) => a.name.localeCompare(b.name));
}
