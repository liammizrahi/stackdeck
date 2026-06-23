"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { TableDetail as TableDetailType, ScanResult } from "@/lib/aws/dynamodb";
import { formatBytes } from "@/lib/utils";

function renderCell(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function TableDetail({
  detail,
  scan,
  tableName,
}: {
  detail: TableDetailType | { error: string };
  scan: ScanResult;
  tableName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(scan.items, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No items</b>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No matches</b>
          </Box>
        ),
      },
      pagination: { pageSize: 20 },
      sorting: {},
    });

  if ("error" in detail) {
    return (
      <ContentLayout header={<Header>{tableName}</Header>}>
        <Alert type="error" header="Failed to load table">
          {detail.error}
        </Alert>
      </ContentLayout>
    );
  }

  const columnDefinitions = scan.columns.map((col) => ({
    id: col,
    header: col,
    sortingField: col,
    isRowHeader: col === scan.columns[0],
    cell: (row: Record<string, unknown>) => renderCell(row[col]),
  }));

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          {detail.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Overview</Header>}>
          <KeyValuePairs
            columns={2}
            items={[
              { label: "Status", value: detail.status },
              { label: "Item count", value: detail.itemCount.toLocaleString() },
              { label: "Size", value: formatBytes(detail.sizeBytes) },
              {
                label: "Keys",
                value:
                  detail.keys.length > 0
                    ? detail.keys.map((k) => `${k.name} (${k.type})`).join(", ")
                    : "—",
              },
            ]}
          />
        </Container>

        <Table<Record<string, unknown>>
          {...collectionProps}
          variant="container"
          stickyHeader
          loading={isPending}
          loadingText="Loading items"
          items={items}
          trackBy={(row) => {
            const first = scan.columns[0];
            return first !== undefined ? String(row[first] ?? "") : JSON.stringify(row);
          }}
          columnDefinitions={columnDefinitions}
          header={
            <Header counter={`(${scan.items.length})`}>Items (first 50)</Header>
          }
          filter={
            <TextFilter
              {...filterProps}
              filteringPlaceholder="Find items"
              countText={`${filteredItemsCount} matches`}
            />
          }
          pagination={<Pagination {...paginationProps} />}
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>No items in this table</b>
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
