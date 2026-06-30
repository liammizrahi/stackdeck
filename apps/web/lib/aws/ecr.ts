import {
  DescribeImagesCommand,
  DescribeRepositoriesCommand,
  ECRClient,
} from "@aws-sdk/client-ecr";
import { clientConfig } from "@/lib/aws/config";

export interface Repository {
  name: string;
  uri: string;
  arn: string;
  createdAt: string | null;
  tagMutability: string;
  scanOnPush: boolean;
}

export interface ImageDetail {
  digest: string;
  tags: string[];
  sizeBytes: number;
  pushedAt: string | null;
  manifestMediaType: string;
}

export interface RepositoryDetail extends Repository {
  images: ImageDetail[];
}

function ecrClient() {
  return new ECRClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listRepositories(): Promise<Repository[]> {
  const client = ecrClient();
  const repositories: Repository[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new DescribeRepositoriesCommand({ nextToken }),
    );
    for (const r of out.repositories ?? []) {
      repositories.push({
        name: r.repositoryName ?? "",
        uri: r.repositoryUri ?? "",
        arn: r.repositoryArn ?? "",
        createdAt: isoOrNull(r.createdAt),
        tagMutability: r.imageTagMutability ?? "",
        scanOnPush: Boolean(r.imageScanningConfiguration?.scanOnPush),
      });
    }
    nextToken = out.nextToken;
  } while (nextToken);

  return repositories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRepository(
  name: string,
): Promise<{ repository?: RepositoryDetail; error?: string }> {
  try {
    const client = ecrClient();
    const metaOut = await client.send(
      new DescribeRepositoriesCommand({ repositoryNames: [name] }),
    );
    const r = metaOut.repositories?.[0];
    if (!r) return { error: "Repository not found" };

    const images: ImageDetail[] = [];
    let nextToken: string | undefined;
    do {
      const imgOut = await client.send(
        new DescribeImagesCommand({ repositoryName: name, nextToken }),
      );
      for (const img of imgOut.imageDetails ?? []) {
        images.push({
          digest: img.imageDigest ?? "",
          tags: img.imageTags ?? [],
          sizeBytes: img.imageSizeInBytes ?? 0,
          pushedAt: isoOrNull(img.imagePushedAt),
          manifestMediaType: img.imageManifestMediaType ?? "",
        });
      }
      nextToken = imgOut.nextToken;
    } while (nextToken);

    images.sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""));

    return {
      repository: {
        name: r.repositoryName ?? name,
        uri: r.repositoryUri ?? "",
        arn: r.repositoryArn ?? "",
        createdAt: isoOrNull(r.createdAt),
        tagMutability: r.imageTagMutability ?? "",
        scanOnPush: Boolean(r.imageScanningConfiguration?.scanOnPush),
        images,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
