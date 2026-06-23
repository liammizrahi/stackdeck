"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import type { Application, Environment, ConfigProfile } from "@/lib/aws/appconfig";
import { columnGroups } from "@/lib/kv";

export default function ApplicationDetail({
  application,
  error,
  environments,
  profiles,
}: {
  application: Application | null;
  error: string | null;
  environments: Environment[];
  profiles: ConfigProfile[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !application) {
    return (
      <ContentLayout header={<Header variant="h1">Application</Header>}>
        <Alert type="error" header="Failed to load application">
          {error ?? "Application not found"}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              loading={isPending}
              onClick={() => startTransition(() => router.refresh())}
            />
          }
        >
          {application.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Application ID", value: application.id },
                { label: "Name", value: application.name },
                {
                  label: "Description",
                  value: application.description || "—",
                },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "environments",
              label: `Environments (${environments.length})`,
              content: (
                <Table<Environment>
                  variant="container"
                  items={environments}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (e) => e.name,
                    },
                    {
                      id: "state",
                      header: "State",
                      cell: (e) => (
                        <StatusIndicator
                          type={
                            e.state === "ReadyForDeployment"
                              ? "success"
                              : "pending"
                          }
                        >
                          {e.state}
                        </StatusIndicator>
                      ),
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (e) => e.description || "—",
                    },
                  ]}
                  header={
                    <Header counter={`(${environments.length})`}>
                      Environments
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No environments</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "profiles",
              label: `Configuration profiles (${profiles.length})`,
              content: (
                <Table<ConfigProfile>
                  variant="container"
                  items={profiles}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (p) => p.name,
                    },
                    {
                      id: "type",
                      header: "Type",
                      cell: (p) => p.type || "—",
                    },
                    {
                      id: "locationUri",
                      header: "Location URI",
                      cell: (p) => p.locationUri || "—",
                    },
                  ]}
                  header={
                    <Header counter={`(${profiles.length})`}>
                      Configuration profiles
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No configuration profiles</b>
                    </Box>
                  }
                />
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
