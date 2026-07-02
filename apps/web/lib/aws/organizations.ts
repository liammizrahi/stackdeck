import {
  DescribeAccountCommand,
  ListAccountsCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";
import { clientConfig } from "@/lib/aws/config";

export interface OrgAccount {
  id: string;
  name: string;
  email: string;
  status: string;
  joinedAt: string | null;
}

export interface OrgAccountDetail extends OrgAccount {
  arn: string;
  joinedMethod: string;
}

function organizationsClient() {
  return new OrganizationsClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listAccounts(): Promise<OrgAccount[]> {
  const client = organizationsClient();
  const accounts: OrgAccount[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListAccountsCommand({ NextToken: nextToken }),
    );
    for (const a of out.Accounts ?? []) {
      accounts.push({
        id: a.Id ?? "",
        name: a.Name ?? "",
        email: a.Email ?? "",
        status: a.Status ?? "",
        joinedAt: isoOrNull(a.JoinedTimestamp),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return accounts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAccount(
  id: string,
): Promise<{ account?: OrgAccountDetail; error?: string }> {
  try {
    const out = await organizationsClient().send(
      new DescribeAccountCommand({ AccountId: id }),
    );
    const a = out.Account;
    if (!a) return { error: "Account not found" };
    return {
      account: {
        id: a.Id ?? id,
        name: a.Name ?? "",
        email: a.Email ?? "",
        status: a.Status ?? "",
        arn: a.Arn ?? "",
        joinedMethod: a.JoinedMethod ?? "",
        joinedAt: isoOrNull(a.JoinedTimestamp),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
