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
import PropertyFilter, {
  type PropertyFilterProps,
} from "@cloudscape-design/components/property-filter";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import type { LogGroup } from "@/lib/aws/cloudwatch";
import { formatBytes } from "@/lib/utils";
import { propertyFilterI18nStrings } from "@/lib/property-filter-i18n";

const filteringProperties: PropertyFilterProps.FilteringProperty[] = [
  {
    key: "name",
    propertyLabel: "Name",
    groupValuesLabel: "Name values",
    operators: [":", "!:", "=", "!="],
  },
  {
    key: "arn",
    propertyLabel: "ARN",
    groupValuesLabel: "ARN values",
    operators: [":", "!:"],
  },
];

function formatRetention(days: number | null): string {
  return days !== null ? `${days} days` : "Never expire";
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function LogGroupsTable({ logGroups }: { logGroups: LogGroup[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, propertyFilterProps, paginationProps } =
    useCollection(logGroups, {
      propertyFiltering: {
        filteringProperties,
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No log groups</b>
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
    <Table<LogGroup>
      {...collectionProps}
      variant="container"
      stickyHeader
      loading={isPending}
      loadingText="Loading log groups"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (group) => (
            <Link
              href={`/services/cloudwatch/${encodeURIComponent(group.name)}`}
              onFollow={(event) => {
                event.preventDefault();
                router.push(`/services/cloudwatch/${encodeURIComponent(group.name)}`);
              }}
            >
              {group.name}
            </Link>
          ),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (group) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={group.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "storedBytes",
          header: "Stored size",
          sortingField: "storedBytes",
          cell: (group) => formatBytes(group.storedBytes),
        },
        {
          id: "retentionInDays",
          header: "Retention",
          cell: (group) => formatRetention(group.retentionInDays),
        },
        {
          id: "creationTime",
          header: "Created",
          sortingField: "creationTime",
          cell: (group) => formatDate(group.creationTime),
        },
      ]}
      header={
        <Header
          counter={`(${logGroups.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
            </SpaceBetween>
          }
        >
          Log Groups
        </Header>
      }
      filter={
        <PropertyFilter
          {...propertyFilterProps}
          i18nStrings={propertyFilterI18nStrings}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
