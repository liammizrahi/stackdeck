import RepositoryDetail from "./RepositoryDetail";
import { getRepository } from "@/lib/aws/ecr";

export const dynamic = "force-dynamic";

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repositoryName = decodeURIComponent(id);
  const { repository, error } = await getRepository(repositoryName);
  return (
    <RepositoryDetail
      repository={repository ?? null}
      error={error ?? null}
    />
  );
}
