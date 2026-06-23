import ApplicationsTable from "./ApplicationsTable";
import { listApplications } from "@/lib/aws/appconfig";

export const dynamic = "force-dynamic";

export default async function AppConfigPage() {
  const applications = await listApplications();
  return <ApplicationsTable applications={applications} />;
}
