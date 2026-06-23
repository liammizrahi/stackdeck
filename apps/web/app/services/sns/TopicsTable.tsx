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
import type { SnsTopic } from "@/lib/aws/sns";

export default function TopicsTable({ topics }: { topics: SnsTopic[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(topics, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No topics</b>
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
    <Table<SnsTopic>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading topics"
      items={items}
      trackBy="arn"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (topic) => {
            const href = `/services/sns/${encodeURIComponent(topic.name)}?arn=${encodeURIComponent(topic.arn)}`;
            return (
              <Link
                href={href}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(href);
                }}
              >
                {topic.name}
              </Link>
            );
          },
        },
        {
          id: "arn",
          header: "ARN",
          sortingField: "arn",
          cell: (topic) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={topic.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "tags",
          header: "Tags",
          cell: (topic) =>
            topic.tags.length === 0 ? (
              "—"
            ) : (
              <SpaceBetween direction="horizontal" size="xxs">
                {topic.tags.map((t) => (
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
          counter={`(${topics.length})`}
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          Topics
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find topics"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
