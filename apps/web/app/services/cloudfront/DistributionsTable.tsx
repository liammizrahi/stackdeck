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
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Distribution } from "@/lib/aws/cloudfront";

export default function DistributionsTable({
  distributions,
}: {
  distributions: Distribution[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(distributions, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No distributions</b>
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

  const href = (id: string) =>
    `/services/cloudfront/${encodeURIComponent(id)}`;

  return (
    <Table<Distribution>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading distributions"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "id",
          header: "ID",
          sortingField: "id",
          isRowHeader: true,
          cell: (d) => (
            <Link
              href={href(d.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(d.id));
              }}
            >
              {d.id}
            </Link>
          ),
        },
        {
          id: "domainName",
          header: "Domain name",
          sortingField: "domainName",
          cell: (d) => d.domainName,
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (d) => (
            <StatusIndicator
              type={d.status === "Deployed" ? "success" : "in-progress"}
            >
              {d.status}
            </StatusIndicator>
          ),
        },
        {
          id: "enabled",
          header: "Enabled",
          cell: (d) => (
            <StatusIndicator type={d.enabled ? "success" : "stopped"}>
              {d.enabled ? "Enabled" : "Disabled"}
            </StatusIndicator>
          ),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (d) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={d.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
      ]}
      header={
        <Header
          counter={`(${distributions.length})`}
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
          Distributions
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find distributions"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
