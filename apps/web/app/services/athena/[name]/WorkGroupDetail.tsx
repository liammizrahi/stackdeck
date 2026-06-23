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
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import type { NamedQuery, WorkGroup } from "@/lib/aws/athena";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function WorkGroupDetail({
  workGroup,
  error,
  queries,
}: {
  workGroup: WorkGroup | null;
  error: string | null;
  queries: NamedQuery[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !workGroup) {
    return (
      <ContentLayout header={<Header variant="h1">Work group</Header>}>
        <Alert type="error" header="Failed to load work group">
          {error ?? "Work group not found"}
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
          {workGroup.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "State", value: workGroup.state || "—" },
                {
                  label: "Output location",
                  value: workGroup.outputLocation || "—",
                },
                { label: "Created", value: formatDate(workGroup.creationDate) },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "savedQueries",
              label: `Saved queries (${queries.length})`,
              content: (
                <Table<NamedQuery>
                  variant="container"
                  items={queries}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (q) => q.name,
                    },
                    {
                      id: "database",
                      header: "Database",
                      cell: (q) => q.database || "—",
                    },
                    {
                      id: "query",
                      header: "Query",
                      cell: (q) =>
                        q.queryString.length > 80
                          ? q.queryString.slice(0, 80) + "…"
                          : q.queryString,
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (q) => q.description || "—",
                    },
                  ]}
                  header={
                    <Header counter={`(${queries.length})`}>
                      Saved queries
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No saved queries</b>
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
