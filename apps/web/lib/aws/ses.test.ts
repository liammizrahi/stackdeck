import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListEmailIdentitiesCommand,
  SESv2Client,
} from "@aws-sdk/client-sesv2";
import { listIdentities } from "@/lib/aws/ses";

const ses = mockClient(SESv2Client);

afterEach(() => ses.reset());

describe("listIdentities", () => {
  it("maps name/verified and sorts by name", async () => {
    ses.on(ListEmailIdentitiesCommand).resolves({
      EmailIdentities: [
        {
          IdentityName: "zeta.example.com",
          IdentityType: "DOMAIN",
          VerificationStatus: "SUCCESS",
          SendingEnabled: true,
        },
        {
          IdentityName: "alpha@example.com",
          IdentityType: "EMAIL_ADDRESS",
          VerificationStatus: "PENDING",
          SendingEnabled: false,
        },
      ],
    });
    const result = await listIdentities();
    expect(result.map((i) => i.name)).toEqual([
      "alpha@example.com",
      "zeta.example.com",
    ]);
    expect(result[0]?.verified).toBe(false);
    expect(result[1]?.verified).toBe(true);
  });

  it("returns empty array when no identities exist", async () => {
    ses.on(ListEmailIdentitiesCommand).resolves({ EmailIdentities: [] });
    const result = await listIdentities();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    ses
      .on(ListEmailIdentitiesCommand, { NextToken: undefined })
      .resolves({
        EmailIdentities: [
          { IdentityName: "beta.example.com", VerificationStatus: "SUCCESS" },
        ],
        NextToken: "page2token",
      })
      .on(ListEmailIdentitiesCommand, { NextToken: "page2token" })
      .resolves({
        EmailIdentities: [
          { IdentityName: "alpha.example.com", VerificationStatus: "PENDING" },
        ],
      });
    const result = await listIdentities();
    expect(result.map((i) => i.name)).toEqual([
      "alpha.example.com",
      "beta.example.com",
    ]);
  });
});
