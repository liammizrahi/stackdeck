import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  BackupClient,
  ListBackupVaultsCommand,
} from "@aws-sdk/client-backup";
import { listVaults } from "@/lib/aws/backup";

const backup = mockClient(BackupClient);

afterEach(() => backup.reset());

describe("listVaults", () => {
  it("maps vaults, recovery points, and sorts by name", async () => {
    backup.on(ListBackupVaultsCommand).resolves({
      BackupVaultList: [
        {
          BackupVaultName: "zeta-vault",
          BackupVaultArn: "arn:aws:backup:us-east-1:123456789012:backup-vault:zeta-vault",
          NumberOfRecoveryPoints: 5,
        },
        {
          BackupVaultName: "alpha-vault",
          BackupVaultArn: "arn:aws:backup:us-east-1:123456789012:backup-vault:alpha-vault",
          NumberOfRecoveryPoints: 2,
        },
      ],
    });
    const result = await listVaults();
    expect(result.map((v) => v.name)).toEqual(["alpha-vault", "zeta-vault"]);
    expect(result[0]?.recoveryPoints).toBe(2);
    expect(result[1]?.recoveryPoints).toBe(5);
  });

  it("returns empty array when no vaults exist", async () => {
    backup.on(ListBackupVaultsCommand).resolves({ BackupVaultList: [] });
    const result = await listVaults();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    backup
      .on(ListBackupVaultsCommand, { NextToken: undefined })
      .resolves({
        BackupVaultList: [{ BackupVaultName: "beta-vault" }],
        NextToken: "page2token",
      })
      .on(ListBackupVaultsCommand, { NextToken: "page2token" })
      .resolves({
        BackupVaultList: [{ BackupVaultName: "alpha-vault" }],
      });
    const result = await listVaults();
    expect(result.map((v) => v.name)).toEqual(["alpha-vault", "beta-vault"]);
  });
});
