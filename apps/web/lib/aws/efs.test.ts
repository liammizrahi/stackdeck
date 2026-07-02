import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DescribeFileSystemsCommand, EFSClient } from "@aws-sdk/client-efs";
import { listFileSystems } from "@/lib/aws/efs";

const efs = mockClient(EFSClient);

afterEach(() => efs.reset());

describe("listFileSystems", () => {
  it("maps id, state, and size and sorts by name", async () => {
    efs.on(DescribeFileSystemsCommand).resolves({
      FileSystems: [
        {
          FileSystemId: "fs-zeta",
          OwnerId: "123456789012",
          CreationToken: "token-zeta",
          CreationTime: new Date("2023-01-02T00:00:00Z"),
          Tags: [],
          Name: "zeta",
          LifeCycleState: "available",
          SizeInBytes: { Value: 2048 },
          NumberOfMountTargets: 1,
          PerformanceMode: "generalPurpose",
          Encrypted: true,
        },
        {
          FileSystemId: "fs-alpha",
          OwnerId: "123456789012",
          CreationToken: "token-alpha",
          CreationTime: new Date("2023-01-01T00:00:00Z"),
          Tags: [],
          Name: "alpha",
          LifeCycleState: "creating",
          SizeInBytes: { Value: 1024 },
          NumberOfMountTargets: 0,
          PerformanceMode: "generalPurpose",
          Encrypted: false,
        },
      ],
    });
    const result = await listFileSystems();
    expect(result.map((f) => f.name)).toEqual(["alpha", "zeta"]);
    expect(result[0]?.id).toBe("fs-alpha");
    expect(result[0]?.state).toBe("creating");
    expect(result[0]?.sizeBytes).toBe(1024);
  });

  it("returns empty array when no file systems exist", async () => {
    efs.on(DescribeFileSystemsCommand).resolves({ FileSystems: [] });
    const result = await listFileSystems();
    expect(result).toEqual([]);
  });
});
