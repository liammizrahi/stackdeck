"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Schedule } from "@/lib/aws/scheduler";

function targetLabel(targetArn: string): string {
  if (!targetArn) return "—";
  const segment = targetArn.split(":").pop();
  return segment && segment.length > 0 ? segment : targetArn;
}

export default function SchedulesTable({
  schedules,
}: {
  schedules: Schedule[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(schedules, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No schedules</b>
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

  const href = (s: Schedule) =>
    `/services/scheduler/${encodeURIComponent(`${s.groupName}~${s.name}`)}`;

  return (
    <Table<Schedule>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading schedules"
      items={items}
      trackBy={(s) => `${s.groupName}~${s.name}`}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (s) => (
            <Link
              href={href(s)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(s));
              }}
            >
              {s.name}
            </Link>
          ),
        },
        {
          id: "groupName",
          header: "Group",
          sortingField: "groupName",
          cell: (s) => s.groupName,
        },
        {
          id: "state",
          header: "State",
          sortingField: "state",
          cell: (s) => (
            <StatusIndicator
              type={s.state === "ENABLED" ? "success" : "stopped"}
            >
              {s.state}
            </StatusIndicator>
          ),
        },
        {
          id: "target",
          header: "Target",
          cell: (s) => targetLabel(s.targetArn),
        },
      ]}
      header={
        <Header
          counter={`(${schedules.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={() => startTransition(() => router.refresh())}
              />
            </SpaceBetween>
          }
        >
          Schedules
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find schedules"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
