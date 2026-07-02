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
import type { DatabaseDetail, GlueTable } from "@/lib/aws/glue";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function DatabaseDetailView({
  detail,
  error,
}: {
  detail: DatabaseDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !detail) {
    return (
      <ContentLayout header={<Header variant="h1">Database</Header>}>
        <Alert type="error" header="Failed to load database">
          {error ?? "Database not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { database, tables } = detail;

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
          {database.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: database.name },
                { label: "Description", value: database.description || "—" },
                { label: "Location", value: database.location || "—" },
                { label: "Created", value: formatDate(database.createTime) },
              ],
              3,
            )}
          />
        </Container>

        <Container header={<Header variant="h2">Tables</Header>}>
          <Table<GlueTable>
            variant="container"
            items={tables}
            trackBy="name"
            columnDefinitions={[
              {
                id: "name",
                header: "Table name",
                isRowHeader: true,
                cell: (t) => t.name,
              },
              {
                id: "tableType",
                header: "Type",
                cell: (t) => t.tableType || "—",
              },
              {
                id: "location",
                header: "Location",
                cell: (t) => t.location || "—",
              },
              {
                id: "columnCount",
                header: "Columns",
                cell: (t) => t.columnCount,
              },
              {
                id: "createTime",
                header: "Created",
                cell: (t) => formatDate(t.createTime),
              },
            ]}
            header={<Header counter={`(${tables.length})`}>Tables</Header>}
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No tables</b>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
