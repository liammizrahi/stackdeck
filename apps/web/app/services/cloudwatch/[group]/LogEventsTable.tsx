"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { LogEvent } from "@/lib/aws/cloudwatch";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function LogEventsTable({
  groupName,
  events,
}: {
  groupName: string;
  events: LogEvent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(events, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No log events</b>
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

  const refresh = () => startTransition(() => router.refresh());

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
            </SpaceBetween>
          }
        >
          {groupName}
        </Header>
      }
    >
      <Table<LogEvent>
        {...collectionProps}
        variant="container"
        stickyHeader
        loading={isPending}
        loadingText="Loading log events"
        items={items}
        trackBy="timestamp"
        columnDefinitions={[
          {
            id: "timestamp",
            header: "Timestamp",
            sortingField: "timestamp",
            isRowHeader: true,
            cell: (event) => formatDate(event.timestamp),
          },
          {
            id: "message",
            header: "Message",
            cell: (event) => (
              <span style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                {event.message}
              </span>
            ),
          },
          {
            id: "logStreamName",
            header: "Stream",
            sortingField: "logStreamName",
            cell: (event) => event.logStreamName,
          },
        ]}
        header={
          <Header counter={`(${events.length})`}>
            Log Events
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find log events"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </ContentLayout>
  );
}
