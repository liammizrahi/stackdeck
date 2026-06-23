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
import type { Ec2Instance, SecurityGroupRef } from "@/lib/aws/ec2";
import { columnGroups } from "@/lib/kv";

function instanceStatusType(
  state: string,
): "success" | "error" | "stopped" | "in-progress" | "pending" {
  if (state === "running") return "success";
  if (state === "stopped" || state === "stopping") return "stopped";
  if (state === "pending" || state === "shutting-down") return "in-progress";
  if (state === "terminated") return "error";
  return "pending";
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function InstanceDetail({
  instance,
}: {
  instance: Ec2Instance | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!instance) {
    return (
      <ContentLayout header={<Header variant="h1">EC2 instance</Header>}>
        <Alert type="error" header="Instance not found">
          The requested instance could not be found.
        </Alert>
      </ContentLayout>
    );
  }

  const {
    id,
    name,
    type,
    state,
    privateIp,
    publicIp,
    imageId,
    availabilityZone,
    vpcId,
    subnetId,
    launchTime,
    securityGroups,
    tags,
  } = instance;

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
                { label: "Instance ID", value: id },
                { label: "Instance type", value: type },
                {
                  label: "State",
                  value: (
                    <StatusIndicator type={instanceStatusType(state)}>
                      {state}
                    </StatusIndicator>
                  ),
                },
                { label: "AMI ID", value: imageId || "—" },
                { label: "Availability zone", value: availabilityZone || "—" },
                { label: "VPC ID", value: vpcId || "—" },
                { label: "Subnet ID", value: subnetId || "—" },
                { label: "Private IP", value: privateIp || "—" },
                { label: "Public IP", value: publicIp || "—" },
                { label: "Launched", value: formatDate(launchTime) },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "security-groups",
              label: `Security groups (${securityGroups.length})`,
              content: (
                <Table<SecurityGroupRef>
                  variant="container"
                  items={securityGroups}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "groupId",
                      header: "Group ID",
                      isRowHeader: true,
                      cell: (g) => g.id,
                    },
                    {
                      id: "name",
                      header: "Name",
                      cell: (g) => g.name || "—",
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
              id: "tags",
              label: `Tags (${tags.length})`,
              content: (
                <Table<{ key: string; value: string }>
                  variant="container"
                  items={tags}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (tag) => tag.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (tag) => tag.value || "—",
                    },
                  ]}
                  header={<Header counter={`(${tags.length})`}>Tags</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No tags</b>
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
