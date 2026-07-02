import {
  DescribeFileSystemsCommand,
  DescribeMountTargetsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";
import { clientConfig } from "@/lib/aws/config";

export interface FileSystem {
  id: string;
  name: string;
  state: string;
  sizeBytes: number;
  mountTargets: number;
  performanceMode: string;
  encrypted: boolean;
  createdAt: string | null;
}

export interface MountTarget {
  id: string;
  subnetId: string;
  state: string;
  ipAddress: string;
  availabilityZone: string;
}

export interface FileSystemDetail extends FileSystem {
  throughputMode: string;
  mountTargetDetails: MountTarget[];
}

function efsClient() {
  return new EFSClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listFileSystems(): Promise<FileSystem[]> {
  const client = efsClient();
  const fileSystems: FileSystem[] = [];
  let marker: string | undefined;
  do {
    const out = await client.send(
      new DescribeFileSystemsCommand({ Marker: marker }),
    );
    for (const fs of out.FileSystems ?? []) {
      fileSystems.push({
        id: fs.FileSystemId ?? "",
        name: fs.Name ?? "",
        state: fs.LifeCycleState ?? "",
        sizeBytes: fs.SizeInBytes?.Value ?? 0,
        mountTargets: fs.NumberOfMountTargets ?? 0,
        performanceMode: fs.PerformanceMode ?? "",
        encrypted: Boolean(fs.Encrypted),
        createdAt: isoOrNull(fs.CreationTime),
      });
    }
    marker = out.NextMarker;
  } while (marker);
  return fileSystems.sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

export async function getFileSystem(
  id: string,
): Promise<{ fileSystem?: FileSystemDetail; error?: string }> {
  try {
    const client = efsClient();
    const out = await client.send(
      new DescribeFileSystemsCommand({ FileSystemId: id }),
    );
    const fs = out.FileSystems?.[0];
    if (!fs) return { error: "File system not found" };

    const mtOut = await client.send(
      new DescribeMountTargetsCommand({ FileSystemId: id }),
    );
    const mountTargetDetails: MountTarget[] = (mtOut.MountTargets ?? []).map(
      (mt) => ({
        id: mt.MountTargetId ?? "",
        subnetId: mt.SubnetId ?? "",
        state: mt.LifeCycleState ?? "",
        ipAddress: mt.IpAddress ?? "",
        availabilityZone: mt.AvailabilityZoneName ?? "",
      }),
    );

    return {
      fileSystem: {
        id: fs.FileSystemId ?? id,
        name: fs.Name ?? "",
        state: fs.LifeCycleState ?? "",
        sizeBytes: fs.SizeInBytes?.Value ?? 0,
        mountTargets: fs.NumberOfMountTargets ?? 0,
        performanceMode: fs.PerformanceMode ?? "",
        encrypted: Boolean(fs.Encrypted),
        createdAt: isoOrNull(fs.CreationTime),
        throughputMode: fs.ThroughputMode ?? "",
        mountTargetDetails,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
