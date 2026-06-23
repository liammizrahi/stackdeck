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
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { DbInstance } from "@/lib/aws/rds";

function instanceStatus(
  status: string,
): "success" | "error" | "warning" | "pending" | "stopped" | "in-progress" {
  if (status === "available") return "success";
  if (status === "failed" || status === "incompatible-restore") return "error";
  if (status === "stopped" || status === "stopping") return "stopped";
  if (
    status === "creating" ||
    status === "modifying" ||
    status === "starting" ||
    status === "rebooting"
  )
    return "in-progress";
  return "pending";
}

function endpointLabel(instance: DbInstance): string {
  if (!instance.endpointAddress) return "—";
  if (instance.endpointPort) {
    return `${instance.endpointAddress}:${instance.endpointPort}`;
  }
  return instance.endpointAddress;
}

export default function InstancesTable({ instances }: { instances: DbInstance[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(instances, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No DB instances</b>
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
    <Table<DbInstance>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading DB instances"
      items={items}
      trackBy="identifier"
      columnDefinitions={[
        {
          id: "identifier",
          header: "DB identifier",
          sortingField: "identifier",
          isRowHeader: true,
          cell: (instance) => (
            <Link
              href={`/services/rds/${encodeURIComponent(instance.identifier)}`}
              onFollow={(event) => {
                event.preventDefault();
                router.push(
                  `/services/rds/${encodeURIComponent(instance.identifier)}`,
                );
              }}
            >
              {instance.identifier}
            </Link>
          ),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (instance) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={instance.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "engine",
          header: "Engine",
          sortingField: "engine",
          cell: (instance) => instance.engine,
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (instance) => (
            <StatusIndicator type={instanceStatus(instance.status)}>
              {instance.status}
            </StatusIndicator>
          ),
        },
        {
          id: "instanceClass",
          header: "Class",
          sortingField: "instanceClass",
          cell: (instance) => instance.instanceClass,
        },
        {
          id: "tags",
          header: "Tags",
          cell: (instance) =>
            instance.tags.length === 0 ? (
              "—"
            ) : (
              <SpaceBetween direction="horizontal" size="xxs">
                {instance.tags.map((t) => (
                  <Badge key={t.key}>
                    {t.key}: {t.value}
                  </Badge>
                ))}
              </SpaceBetween>
            ),
        },
        {
          id: "endpoint",
          header: "Endpoint",
          cell: endpointLabel,
        },
      ]}
      header={
        <Header
          counter={`(${instances.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
            </SpaceBetween>
          }
        >
          DB Instances
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find DB instances"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
