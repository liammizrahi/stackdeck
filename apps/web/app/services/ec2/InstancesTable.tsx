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
import type { Ec2Instance } from "@/lib/aws/ec2";

function instanceStatusType(
  state: string,
): "success" | "error" | "stopped" | "in-progress" | "pending" {
  if (state === "running") return "success";
  if (state === "stopped" || state === "stopping") return "stopped";
  if (state === "pending" || state === "shutting-down") return "in-progress";
  if (state === "terminated") return "error";
  return "pending";
}

export default function InstancesTable({
  instances,
}: {
  instances: Ec2Instance[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(instances, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No instances</b>
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
    `/services/ec2/${encodeURIComponent(id)}`;

  return (
    <Table<Ec2Instance>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading instances"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (instance) => (
            <Link
              href={href(instance.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(instance.id));
              }}
            >
              {instance.name || instance.id}
            </Link>
          ),
        },
        {
          id: "id",
          header: "Instance ID",
          sortingField: "id",
          cell: (instance) => instance.id,
        },
        {
          id: "type",
          header: "Type",
          sortingField: "type",
          cell: (instance) => instance.type,
        },
        {
          id: "state",
          header: "State",
          sortingField: "state",
          cell: (instance) => (
            <StatusIndicator type={instanceStatusType(instance.state)}>
              {instance.state}
            </StatusIndicator>
          ),
        },
        {
          id: "publicIp",
          header: "Public IP",
          cell: (instance) => instance.publicIp || "—",
        },
        {
          id: "privateIp",
          header: "Private IP",
          cell: (instance) => instance.privateIp || "—",
        },
        {
          id: "availabilityZone",
          header: "Availability zone",
          sortingField: "availabilityZone",
          cell: (instance) => instance.availabilityZone,
        },
      ]}
      header={
        <Header
          counter={`(${instances.length})`}
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
          Instances
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find instances"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
