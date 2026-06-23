import ApplicationDetail from "./ApplicationDetail";
import {
  getApplication,
  listEnvironments,
  listConfigurationProfiles,
} from "@/lib/aws/appconfig";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appId = decodeURIComponent(id);
  const [{ application, error }, environments, profiles] = await Promise.all([
    getApplication(appId),
    listEnvironments(appId),
    listConfigurationProfiles(appId),
  ]);
  return (
    <ApplicationDetail
      application={application ?? null}
      error={error ?? null}
      environments={environments}
      profiles={profiles}
    />
  );
}
