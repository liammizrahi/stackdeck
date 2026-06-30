import RepositoriesTable from "./RepositoriesTable";
import { listRepositories } from "@/lib/aws/ecr";

export const dynamic = "force-dynamic";

export default async function EcrPage() {
  const repositories = await listRepositories();
  return <RepositoriesTable repositories={repositories} />;
}
