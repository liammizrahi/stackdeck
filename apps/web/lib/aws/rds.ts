import {
  CreateDBInstanceCommand,
  DeleteDBInstanceCommand,
  DescribeDBInstancesCommand,
  RDSClient,
} from "@aws-sdk/client-rds";
import { clientConfig } from "@/lib/aws/config";

export interface CreateDbInstanceInput {
  identifier: string;
  engine: string;
  engineVersion: string;
  instanceClass: string;
  allocatedStorage: number;
  masterUsername: string;
  masterPassword: string;
  dbName: string;
}

export interface DbInstance {
  identifier: string;
  engine: string;
  engineVersion: string;
  status: string;
  instanceClass: string;
  endpointAddress: string | null;
  endpointPort: number | null;
  dbName: string | null;
  masterUsername: string | null;
  allocatedStorage: number | null;
  multiAz: boolean;
  availabilityZone: string | null;
  createTime: string | null;
  arn: string;
  tags: { key: string; value: string }[];
}

function rdsClient() {
  return new RDSClient(clientConfig());
}

function mapInstance(raw: {
  DBInstanceIdentifier?: string;
  Engine?: string;
  EngineVersion?: string;
  DBInstanceStatus?: string;
  DBInstanceClass?: string;
  Endpoint?: { Address?: string; Port?: number };
  DBName?: string;
  MasterUsername?: string;
  AllocatedStorage?: number;
  MultiAZ?: boolean;
  AvailabilityZone?: string;
  InstanceCreateTime?: Date;
  DBInstanceArn?: string;
  TagList?: { Key?: string; Value?: string }[];
}): DbInstance {
  return {
    identifier: raw.DBInstanceIdentifier ?? "",
    engine: raw.Engine ?? "",
    engineVersion: raw.EngineVersion ?? "",
    status: raw.DBInstanceStatus ?? "",
    instanceClass: raw.DBInstanceClass ?? "",
    endpointAddress: raw.Endpoint?.Address ?? null,
    endpointPort: raw.Endpoint?.Port ?? null,
    dbName: raw.DBName ?? null,
    masterUsername: raw.MasterUsername ?? null,
    allocatedStorage: raw.AllocatedStorage ?? null,
    multiAz: raw.MultiAZ ?? false,
    availabilityZone: raw.AvailabilityZone ?? null,
    createTime: raw.InstanceCreateTime ? raw.InstanceCreateTime.toISOString() : null,
    arn: raw.DBInstanceArn ?? "",
    tags: (raw.TagList ?? []).map((t) => ({ key: t.Key ?? "", value: t.Value ?? "" })),
  };
}

export async function listDbInstances(): Promise<DbInstance[]> {
  const client = rdsClient();
  const instances: DbInstance[] = [];
  let marker: string | undefined;

  do {
    const out = await client.send(
      new DescribeDBInstancesCommand({ Marker: marker }),
    );
    for (const raw of out.DBInstances ?? []) {
      instances.push(mapInstance(raw));
    }
    marker = out.Marker;
  } while (marker);

  return instances.sort((a, b) => a.identifier.localeCompare(b.identifier));
}

export async function createDbInstance(
  input: CreateDbInstanceInput,
): Promise<void> {
  await rdsClient().send(
    new CreateDBInstanceCommand({
      DBInstanceIdentifier: input.identifier,
      Engine: input.engine,
      EngineVersion: input.engineVersion || undefined,
      DBInstanceClass: input.instanceClass,
      AllocatedStorage: input.allocatedStorage,
      MasterUsername: input.masterUsername,
      MasterUserPassword: input.masterPassword,
      DBName: input.dbName || undefined,
    }),
  );
}

export async function deleteDbInstance(identifier: string): Promise<void> {
  await rdsClient().send(
    new DeleteDBInstanceCommand({
      DBInstanceIdentifier: identifier,
      SkipFinalSnapshot: true,
      DeleteAutomatedBackups: true,
    }),
  );
}

export async function getDbInstance(
  id: string,
): Promise<{ instance?: DbInstance; error?: string }> {
  try {
    const client = rdsClient();
    const out = await client.send(
      new DescribeDBInstancesCommand({ DBInstanceIdentifier: id }),
    );
    const raw = (out.DBInstances ?? [])[0];
    if (!raw) return { error: "DB instance not found" };
    return { instance: mapInstance(raw) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
