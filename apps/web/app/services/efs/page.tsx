import FileSystemsTable from "./FileSystemsTable";
import { listFileSystems } from "@/lib/aws/efs";

export const dynamic = "force-dynamic";

export default async function EfsPage() {
  const fileSystems = await listFileSystems();
  return <FileSystemsTable fileSystems={fileSystems} />;
}
