import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListAccountsCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";
import { listAccounts } from "@/lib/aws/organizations";

const organizations = mockClient(OrganizationsClient);

afterEach(() => organizations.reset());

describe("listAccounts", () => {
  it("maps accounts and sorts by name", async () => {
    organizations.on(ListAccountsCommand).resolves({
      Accounts: [
        {
          Id: "222222222222",
          Name: "Zeta",
          Email: "zeta@example.com",
          Status: "ACTIVE",
        },
        {
          Id: "111111111111",
          Name: "Alpha",
          Email: "alpha@example.com",
          Status: "ACTIVE",
        },
      ],
    });
    const result = await listAccounts();
    expect(result.map((a) => a.name)).toEqual(["Alpha", "Zeta"]);
    expect(result[0]?.id).toBe("111111111111");
    expect(result[0]?.email).toBe("alpha@example.com");
  });

  it("returns empty array when no accounts exist", async () => {
    organizations.on(ListAccountsCommand).resolves({ Accounts: [] });
    const result = await listAccounts();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    organizations
      .on(ListAccountsCommand, { NextToken: undefined })
      .resolves({
        Accounts: [
          {
            Id: "222222222222",
            Name: "Beta",
            Email: "beta@example.com",
            Status: "ACTIVE",
          },
        ],
        NextToken: "page2token",
      })
      .on(ListAccountsCommand, { NextToken: "page2token" })
      .resolves({
        Accounts: [
          {
            Id: "111111111111",
            Name: "Alpha",
            Email: "alpha@example.com",
            Status: "ACTIVE",
          },
        ],
      });
    const result = await listAccounts();
    expect(result.map((a) => a.name)).toEqual(["Alpha", "Beta"]);
  });
});
