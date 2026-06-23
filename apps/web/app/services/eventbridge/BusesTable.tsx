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
import type { EventBus } from "@/lib/aws/eventbridge";

export default function BusesTable({ buses }: { buses: EventBus[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(buses, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No event buses</b>
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

  const href = (name: string) =>
    `/services/eventbridge/${encodeURIComponent(name)}`;

  return (
    <Table<EventBus>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading event buses"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (bus) => (
            <Link
              href={href(bus.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(bus.name));
              }}
            >
              {bus.name}
            </Link>
          ),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (bus) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={bus.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "ruleCount",
          header: "Rules",
          sortingField: "ruleCount",
          cell: (bus) => bus.ruleCount,
        },
      ]}
      header={
        <Header
          counter={`(${buses.length})`}
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
          Event buses
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find event buses"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
