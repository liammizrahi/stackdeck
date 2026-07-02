import {
  BackupClient,
  DescribeBackupVaultCommand,
  ListBackupVaultsCommand,
  ListRecoveryPointsByBackupVaultCommand,
} from "@aws-sdk/client-backup";
import { clientConfig } from "@/lib/aws/config";

export interface BackupVault {
  name: string;
  arn: string;
  recoveryPoints: number;
  createdAt: string | null;
}

export interface RecoveryPoint {
  arn: string;
  resourceType: string;
  resourceArn: string;
  status: string;
  sizeBytes: number;
  createdAt: string | null;
}

export interface BackupVaultDetail extends BackupVault {
  points: RecoveryPoint[];
}

function backupClient() {
  return new BackupClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listVaults(): Promise<BackupVault[]> {
  const client = backupClient();
  const vaults: BackupVault[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListBackupVaultsCommand({ NextToken: nextToken }),
    );
    for (const v of out.BackupVaultList ?? []) {
      vaults.push({
        name: v.BackupVaultName ?? "",
        arn: v.BackupVaultArn ?? "",
        recoveryPoints: v.NumberOfRecoveryPoints ?? 0,
        createdAt: isoOrNull(v.CreationDate),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return vaults.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVault(
  name: string,
): Promise<{ vault?: BackupVaultDetail; error?: string }> {
  try {
    const client = backupClient();
    const meta = await client.send(
      new DescribeBackupVaultCommand({ BackupVaultName: name }),
    );

    const points: RecoveryPoint[] = [];
    let nextToken: string | undefined;
    do {
      const out = await client.send(
        new ListRecoveryPointsByBackupVaultCommand({
          BackupVaultName: name,
          NextToken: nextToken,
        }),
      );
      for (const p of out.RecoveryPoints ?? []) {
        points.push({
          arn: p.RecoveryPointArn ?? "",
          resourceType: p.ResourceType ?? "",
          resourceArn: p.ResourceArn ?? "",
          status: p.Status ?? "",
          sizeBytes: p.BackupSizeInBytes ?? 0,
          createdAt: isoOrNull(p.CreationDate),
        });
      }
      nextToken = out.NextToken;
    } while (nextToken);

    return {
      vault: {
        name,
        arn: meta.BackupVaultArn ?? "",
        recoveryPoints: meta.NumberOfRecoveryPoints ?? 0,
        createdAt: isoOrNull(meta.CreationDate),
        points,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
