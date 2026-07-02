import FileSystemDetail from "./FileSystemDetail";
import { getFileSystem } from "@/lib/aws/efs";

export const dynamic = "force-dynamic";

export default async function FileSystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fileSystemId = decodeURIComponent(id);
  const { fileSystem, error } = await getFileSystem(fileSystemId);
  return (
    <FileSystemDetail fileSystem={fileSystem ?? null} error={error ?? null} />
  );
}
