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
import type { HostedZoneDetail, RecordSet } from "@/lib/aws/route53";
import { columnGroups } from "@/lib/kv";

interface RecordRow extends RecordSet {
  id: string;
}

export default function HostedZoneDetailView({
  detail,
  error,
}: {
  detail: HostedZoneDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !detail) {
    return (
      <ContentLayout header={<Header variant="h1">Hosted zone</Header>}>
        <Alert type="error" header="Failed to load hosted zone">
          {error ?? "Hosted zone not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { zone, records } = detail;
  const rows: RecordRow[] = records.map((r) => ({
    ...r,
    id: `${r.name}-${r.type}`,
  }));

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
          {zone.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: zone.name },
                { label: "Hosted zone ID", value: zone.id },
                {
                  label: "Type",
                  value: zone.privateZone ? "Private" : "Public",
                },
                { label: "Record count", value: zone.recordCount },
                { label: "Comment", value: zone.comment || "—" },
              ],
              3,
            )}
          />
        </Container>

        <Table<RecordRow>
          variant="container"
          items={rows}
          trackBy="id"
          columnDefinitions={[
            {
              id: "name",
              header: "Name",
              isRowHeader: true,
              cell: (r) => r.name,
            },
            {
              id: "type",
              header: "Type",
              cell: (r) => r.type,
            },
            {
              id: "ttl",
              header: "TTL",
              cell: (r) => (r.ttl ?? "—"),
            },
            {
              id: "value",
              header: "Value",
              cell: (r) =>
                r.values.map((v, i) => <div key={i}>{v}</div>),
            },
          ]}
          header={
            <Header counter={`(${rows.length})`}>Records</Header>
          }
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>No records</b>
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
