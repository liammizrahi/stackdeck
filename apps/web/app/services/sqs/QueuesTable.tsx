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
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { SqsQueue } from "@/lib/aws/sqs";

export default function QueuesTable({ queues }: { queues: SqsQueue[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(queues, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No queues</b>
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
    <Table<SqsQueue>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading queues"
      trackBy="url"
      items={items}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (queue) => (
            <Link
              href={`/services/sqs/${encodeURIComponent(queue.name)}?url=${encodeURIComponent(queue.url)}`}
              onFollow={(event) => {
                event.preventDefault();
                router.push(
                  `/services/sqs/${encodeURIComponent(queue.name)}?url=${encodeURIComponent(queue.url)}`,
                );
              }}
            >
              {queue.name}
            </Link>
          ),
        },
        {
          id: "visible",
          header: "Visible",
          sortingField: "visible",
          cell: (queue) => queue.visible,
        },
        {
          id: "inflight",
          header: "In flight",
          sortingField: "inflight",
          cell: (queue) => queue.inflight,
        },
        {
          id: "arn",
          header: "ARN",
          cell: (queue) => queue.arn,
        },
      ]}
      header={
        <Header
          counter={`(${queues.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
            </SpaceBetween>
          }
        >
          Queues
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find queues"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
