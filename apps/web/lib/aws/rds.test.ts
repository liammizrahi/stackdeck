import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DescribeDBInstancesCommand, RDSClient } from "@aws-sdk/client-rds";
import { listDbInstances, getDbInstance } from "@/lib/aws/rds";

const rds = mockClient(RDSClient);

afterEach(() => rds.reset());

describe("listDbInstances", () => {
  it("maps fields, converts dates to ISO strings, and sorts by identifier", async () => {
    rds.on(DescribeDBInstancesCommand).resolves({
      DBInstances: [
        {
          DBInstanceIdentifier: "zebra-db",
          Engine: "mysql",
          EngineVersion: "8.0.33",
          DBInstanceStatus: "available",
          DBInstanceClass: "db.t3.micro",
          Endpoint: { Address: "zebra.example.com", Port: 3306 },
          DBName: "mydb",
          MasterUsername: "admin",
          AllocatedStorage: 20,
          MultiAZ: false,
          AvailabilityZone: "us-east-1a",
          InstanceCreateTime: new Date("2023-01-01T00:00:00Z"),
          DBInstanceArn: "arn:aws:rds:us-east-1:123456789012:db:zebra-db",
        },
        {
          DBInstanceIdentifier: "alpha-db",
          Engine: "postgres",
          EngineVersion: "15.3",
          DBInstanceStatus: "stopped",
          DBInstanceClass: "db.t3.small",
          Endpoint: { Address: "alpha.example.com", Port: 5432 },
          DBName: "appdb",
          MasterUsername: "root",
          AllocatedStorage: 50,
          MultiAZ: true,
          AvailabilityZone: "us-east-1b",
          InstanceCreateTime: new Date("2022-06-15T00:00:00Z"),
          DBInstanceArn: "arn:aws:rds:us-east-1:123456789012:db:alpha-db",
        },
      ],
    });

    const result = await listDbInstances();
    expect(result.map((i) => i.identifier)).toEqual(["alpha-db", "zebra-db"]);

    const alpha = result[0]!;
    expect(alpha.engine).toBe("postgres");
    expect(alpha.engineVersion).toBe("15.3");
    expect(alpha.status).toBe("stopped");
    expect(alpha.instanceClass).toBe("db.t3.small");
    expect(alpha.endpointAddress).toBe("alpha.example.com");
    expect(alpha.endpointPort).toBe(5432);
    expect(alpha.dbName).toBe("appdb");
    expect(alpha.masterUsername).toBe("root");
    expect(alpha.allocatedStorage).toBe(50);
    expect(alpha.multiAz).toBe(true);
    expect(alpha.availabilityZone).toBe("us-east-1b");
    expect(alpha.createTime).toBe(new Date("2022-06-15T00:00:00Z").toISOString());
    expect(alpha.arn).toBe("arn:aws:rds:us-east-1:123456789012:db:alpha-db");
  });

  it("handles empty results", async () => {
    rds.on(DescribeDBInstancesCommand).resolves({ DBInstances: [] });
    const result = await listDbInstances();
    expect(result).toEqual([]);
  });

  it("handles missing optional fields with nulls", async () => {
    rds.on(DescribeDBInstancesCommand).resolves({
      DBInstances: [
        {
          DBInstanceIdentifier: "minimal-db",
          Engine: "mysql",
          EngineVersion: "8.0",
          DBInstanceStatus: "creating",
          DBInstanceClass: "db.t3.micro",
        },
      ],
    });
    const result = await listDbInstances();
    expect(result[0]!.endpointAddress).toBeNull();
    expect(result[0]!.endpointPort).toBeNull();
    expect(result[0]!.dbName).toBeNull();
    expect(result[0]!.createTime).toBeNull();
    expect(result[0]!.multiAz).toBe(false);
  });
});

describe("getDbInstance", () => {
  it("returns an instance when found", async () => {
    rds.on(DescribeDBInstancesCommand).resolves({
      DBInstances: [
        {
          DBInstanceIdentifier: "prod-db",
          Engine: "mysql",
          EngineVersion: "8.0.33",
          DBInstanceStatus: "available",
          DBInstanceClass: "db.m5.large",
          Endpoint: { Address: "prod.example.com", Port: 3306 },
          DBName: "production",
          MasterUsername: "dbadmin",
          AllocatedStorage: 100,
          MultiAZ: true,
          AvailabilityZone: "us-east-1c",
          InstanceCreateTime: new Date("2021-03-10T00:00:00Z"),
          DBInstanceArn: "arn:aws:rds:us-east-1:123456789012:db:prod-db",
        },
      ],
    });

    const { instance, error } = await getDbInstance("prod-db");
    expect(error).toBeUndefined();
    expect(instance?.identifier).toBe("prod-db");
    expect(instance?.engine).toBe("mysql");
  });

  it("returns error when no instances found", async () => {
    rds.on(DescribeDBInstancesCommand).resolves({ DBInstances: [] });
    const { instance, error } = await getDbInstance("nonexistent");
    expect(instance).toBeUndefined();
    expect(error).toBe("DB instance not found");
  });
});
