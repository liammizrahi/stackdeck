"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import type {
  RouteTableSummary,
  SecurityGroupSummary,
  Subnet,
  VpcDetail,
} from "@/lib/aws/vpc";
import { columnGroups } from "@/lib/kv";

export default function VpcDetailView({
  vpc,
  error,
}: {
  vpc: VpcDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !vpc) {
    return (
      <ContentLayout header={<Header variant="h1">VPC</Header>}>
        <Alert type="error" header="Failed to load VPC">
          {error ?? "VPC not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    id,
    name,
    cidrBlock,
    state,
    isDefault,
    subnets,
    securityGroups,
    routeTables,
  } = vpc;

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              loading={isPending}
              onClick={() => startTransition(() => router.refresh())}
            />
          }
        >
          {name || id}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: name || "—" },
                { label: "VPC ID", value: id },
                { label: "CIDR", value: cidrBlock },
                {
                  label: "State",
                  value: (
                    <StatusIndicator
                      type={state === "available" ? "success" : "in-progress"}
                    >
                      {state}
                    </StatusIndicator>
                  ),
                },
                { label: "Default", value: isDefault ? "Yes" : "No" },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "subnets",
              label: `Subnets (${subnets.length})`,
              content: (
                <Table<Subnet>
                  variant="container"
                  items={subnets}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "id",
                      header: "Subnet ID",
                      isRowHeader: true,
                      cell: (s) => s.id,
                    },
                    {
                      id: "name",
                      header: "Name",
                      cell: (s) => s.name || "—",
                    },
                    {
                      id: "cidrBlock",
                      header: "CIDR",
                      cell: (s) => s.cidrBlock,
                    },
                    {
                      id: "availabilityZone",
                      header: "AZ",
                      cell: (s) => s.availabilityZone,
                    },
                    {
                      id: "state",
                      header: "State",
                      cell: (s) => s.state,
                    },
                    {
                      id: "availableIps",
                      header: "Available IPs",
                      cell: (s) => s.availableIps,
                    },
                    {
                      id: "mapPublicIpOnLaunch",
                      header: "Public IP on launch",
                      cell: (s) => (s.mapPublicIpOnLaunch ? "Yes" : "No"),
                    },
                  ]}
                  header={
                    <Header counter={`(${subnets.length})`}>Subnets</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No subnets</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "securityGroups",
              label: `Security groups (${securityGroups.length})`,
              content: (
                <Table<SecurityGroupSummary>
                  variant="container"
                  items={securityGroups}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "id",
                      header: "Group ID",
                      isRowHeader: true,
                      cell: (g) => g.id,
                    },
                    {
                      id: "name",
                      header: "Name",
                      cell: (g) => g.name,
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (g) => g.description,
                    },
                  ]}
                  header={
                    <Header counter={`(${securityGroups.length})`}>
                      Security groups
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No security groups</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "routeTables",
              label: `Route tables (${routeTables.length})`,
              content: (
                <Table<RouteTableSummary>
                  variant="container"
                  items={routeTables}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "id",
                      header: "Route table ID",
                      isRowHeader: true,
                      cell: (r) => r.id,
                    },
                    {
                      id: "name",
                      header: "Name",
                      cell: (r) => r.name || "—",
                    },
                    {
                      id: "routeCount",
                      header: "Routes",
                      cell: (r) => r.routeCount,
                    },
                    {
                      id: "associationCount",
                      header: "Associations",
                      cell: (r) => r.associationCount,
                    },
                  ]}
                  header={
                    <Header counter={`(${routeTables.length})`}>
                      Route tables
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No route tables</b>
                    </Box>
                  }
                />
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
