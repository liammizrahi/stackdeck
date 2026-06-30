import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListSecretsCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { listSecrets } from "@/lib/aws/secretsmanager";

const secretsManager = mockClient(SecretsManagerClient);

afterEach(() => secretsManager.reset());

describe("listSecrets", () => {
  it("maps fields and sorts by name", async () => {
    secretsManager.on(ListSecretsCommand).resolves({
      SecretList: [
        {
          Name: "zeta-secret",
          ARN: "arn:aws:secretsmanager:us-east-1:123456789012:secret:zeta-secret",
          Description: "Zeta",
          LastChangedDate: new Date("2024-01-02T00:00:00.000Z"),
          LastAccessedDate: new Date("2024-01-03T00:00:00.000Z"),
        },
        {
          Name: "alpha-secret",
          ARN: "arn:aws:secretsmanager:us-east-1:123456789012:secret:alpha-secret",
          Description: "Alpha",
          LastChangedDate: new Date("2024-01-01T00:00:00.000Z"),
        },
      ],
    });
    const result = await listSecrets();
    expect(result.map((s) => s.name)).toEqual([
      "alpha-secret",
      "zeta-secret",
    ]);
    expect(result[0]?.arn).toBe(
      "arn:aws:secretsmanager:us-east-1:123456789012:secret:alpha-secret",
    );
    expect(result[0]?.description).toBe("Alpha");
    expect(result[0]?.lastChangedDate).toBe("2024-01-01T00:00:00.000Z");
    expect(result[0]?.lastAccessedDate).toBeNull();
    expect(result[1]?.lastAccessedDate).toBe("2024-01-03T00:00:00.000Z");
  });

  it("returns empty array when no secrets exist", async () => {
    secretsManager.on(ListSecretsCommand).resolves({ SecretList: [] });
    const result = await listSecrets();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    secretsManager
      .on(ListSecretsCommand, { NextToken: undefined })
      .resolves({
        SecretList: [{ Name: "beta-secret", ARN: "arn:beta" }],
        NextToken: "page2token",
      })
      .on(ListSecretsCommand, { NextToken: "page2token" })
      .resolves({
        SecretList: [{ Name: "alpha-secret", ARN: "arn:alpha" }],
      });
    const result = await listSecrets();
    expect(result.map((s) => s.name)).toEqual([
      "alpha-secret",
      "beta-secret",
    ]);
  });
});
