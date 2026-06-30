"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { StateMachine } from "@/lib/aws/stepfunctions";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function StateMachinesTable({
  machines,
}: {
  machines: StateMachine[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(machines, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No state machines</b>
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

  const href = (arn: string) =>
    `/services/stepfunctions/${encodeURIComponent(arn)}`;

  return (
    <Table<StateMachine>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading state machines"
      items={items}
      trackBy="arn"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (m) => (
            <Link
              href={href(m.arn)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(m.arn));
              }}
            >
              {m.name}
            </Link>
          ),
        },
        {
          id: "type",
          header: "Type",
          sortingField: "type",
          cell: (m) => m.type,
        },
        {
          id: "creationDate",
          header: "Created",
          sortingField: "creationDate",
          cell: (m) => formatDate(m.creationDate),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (m) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={m.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
      ]}
      header={
        <Header
          counter={`(${machines.length})`}
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
          State machines
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find state machines"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
