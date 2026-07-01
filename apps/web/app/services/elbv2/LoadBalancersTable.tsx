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
import type { StatusIndicatorProps } from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { LoadBalancer } from "@/lib/aws/elbv2";

function stateType(state: string): StatusIndicatorProps.Type {
  if (state === "active") return "success";
  if (state === "provisioning") return "in-progress";
  return "error";
}

export default function LoadBalancersTable({
  loadBalancers,
}: {
  loadBalancers: LoadBalancer[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(loadBalancers, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No load balancers</b>
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
    `/services/elbv2/${encodeURIComponent(arn)}`;

  return (
    <Table<LoadBalancer>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading load balancers"
      items={items}
      trackBy="arn"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (lb) => (
            <Link
              href={href(lb.arn)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(lb.arn));
              }}
            >
              {lb.name}
            </Link>
          ),
        },
        {
          id: "dnsName",
          header: "DNS name",
          sortingField: "dnsName",
          cell: (lb) =>
            lb.dnsName ? (
              <CopyToClipboard
                variant="inline"
                textToCopy={lb.dnsName}
                copySuccessText="DNS name copied"
                copyErrorText="Failed to copy DNS name"
              />
            ) : (
              "—"
            ),
        },
        {
          id: "type",
          header: "Type",
          sortingField: "type",
          cell: (lb) => lb.type,
        },
        {
          id: "scheme",
          header: "Scheme",
          sortingField: "scheme",
          cell: (lb) => lb.scheme,
        },
        {
          id: "state",
          header: "State",
          sortingField: "state",
          cell: (lb) => (
            <StatusIndicator type={stateType(lb.state)}>
              {lb.state}
            </StatusIndicator>
          ),
        },
      ]}
      header={
        <Header
          counter={`(${loadBalancers.length})`}
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
          Load balancers
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find load balancers"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
