import {
  AppConfigClient,
  ListApplicationsCommand,
  GetApplicationCommand,
  ListEnvironmentsCommand,
  ListConfigurationProfilesCommand,
} from "@aws-sdk/client-appconfig";
import { clientConfig } from "@/lib/aws/config";

export interface Application {
  id: string;
  name: string;
  description: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  state: string;
}

export interface ConfigProfile {
  id: string;
  name: string;
  type: string;
  locationUri: string;
}

function appconfigClient() {
  return new AppConfigClient(clientConfig());
}

export async function listApplications(): Promise<Application[]> {
  const out = await appconfigClient().send(new ListApplicationsCommand({}));
  return (out.Items ?? [])
    .map((a) => ({
      id: a.Id ?? "",
      name: a.Name ?? "",
      description: a.Description ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getApplication(
  id: string,
): Promise<{ application?: Application; error?: string }> {
  try {
    const out = await appconfigClient().send(
      new GetApplicationCommand({ ApplicationId: id }),
    );
    return {
      application: {
        id: out.Id ?? "",
        name: out.Name ?? "",
        description: out.Description ?? "",
      },
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listEnvironments(appId: string): Promise<Environment[]> {
  try {
    const out = await appconfigClient().send(
      new ListEnvironmentsCommand({ ApplicationId: appId }),
    );
    return (out.Items ?? []).map((e) => ({
      id: e.Id ?? "",
      name: e.Name ?? "",
      description: e.Description ?? "",
      state: e.State ?? "",
    }));
  } catch {
    return [];
  }
}

export async function listConfigurationProfiles(
  appId: string,
): Promise<ConfigProfile[]> {
  try {
    const out = await appconfigClient().send(
      new ListConfigurationProfilesCommand({ ApplicationId: appId }),
    );
    return (out.Items ?? []).map((p) => ({
      id: p.Id ?? "",
      name: p.Name ?? "",
      type: p.Type ?? "",
      locationUri: p.LocationUri ?? "",
    }));
  } catch {
    return [];
  }
}
