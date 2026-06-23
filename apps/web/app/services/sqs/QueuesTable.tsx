"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
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
          id: "arn",
          header: "ARN",
          cell: (queue) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={queue.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
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
          id: "tags",
          header: "Tags",
          cell: (queue) =>
            queue.tags.length === 0 ? (
              "—"
            ) : (
              <SpaceBetween direction="horizontal" size="xxs">
                {queue.tags.map((t) => (
                  <Badge key={t.key}>
                    {t.key}: {t.value}
                  </Badge>
                ))}
              </SpaceBetween>
            ),
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
