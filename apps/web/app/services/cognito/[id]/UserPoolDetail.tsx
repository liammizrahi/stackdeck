"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import type {
  PoolClient,
  PoolGroup,
  PoolUser,
  UserPool,
} from "@/lib/aws/cognito";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function UserPoolDetail({
  pool,
  error,
  users,
  groups,
  clients,
}: {
  pool: UserPool | null;
  error: string | null;
  users: PoolUser[];
  groups: PoolGroup[];
  clients: PoolClient[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !pool) {
    return (
      <ContentLayout header={<Header variant="h1">User pool</Header>}>
        <Alert type="error" header="Failed to load user pool">
          {error ?? "User pool not found"}
        </Alert>
      </ContentLayout>
    );
  }

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
          {pool.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Pool details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Pool ID", value: pool.id },
                {
                  label: "ARN",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={pool.arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ),
                },
                {
                  label: "Estimated users",
                  value:
                    pool.estimatedUsers != null
                      ? String(pool.estimatedUsers)
                      : "—",
                },
                { label: "MFA", value: pool.mfaConfiguration || "OFF" },
                { label: "Created", value: formatDate(pool.creationDate) },
                {
                  label: "Last modified",
                  value: formatDate(pool.lastModifiedDate),
                },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "users",
              label: `Users (${users.length})`,
              content: (
                <Table<PoolUser>
                  variant="container"
                  items={users}
                  trackBy="username"
                  columnDefinitions={[
                    {
                      id: "username",
                      header: "Username",
                      isRowHeader: true,
                      cell: (u) => u.username,
                    },
                    { id: "email", header: "Email", cell: (u) => u.email || "—" },
                    {
                      id: "status",
                      header: "Status",
                      cell: (u) => u.status,
                    },
                    {
                      id: "enabled",
                      header: "Enabled",
                      cell: (u) => (
                        <StatusIndicator
                          type={u.enabled ? "success" : "stopped"}
                        >
                          {u.enabled ? "Enabled" : "Disabled"}
                        </StatusIndicator>
                      ),
                    },
                    {
                      id: "created",
                      header: "Created",
                      cell: (u) => formatDate(u.created),
                    },
                  ]}
                  header={<Header counter={`(${users.length})`}>Users</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No users</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "groups",
              label: `Groups (${groups.length})`,
              content: (
                <Table<PoolGroup>
                  variant="container"
                  items={groups}
                  trackBy="name"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (g) => g.name,
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (g) => g.description || "—",
                    },
                    {
                      id: "precedence",
                      header: "Precedence",
                      cell: (g) => (g.precedence != null ? g.precedence : "—"),
                    },
                  ]}
                  header={<Header counter={`(${groups.length})`}>Groups</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No groups</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "clients",
              label: `App clients (${clients.length})`,
              content: (
                <Table<PoolClient>
                  variant="container"
                  items={clients}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (c) => c.name || "—",
                    },
                    { id: "id", header: "Client ID", cell: (c) => c.id },
                  ]}
                  header={
                    <Header counter={`(${clients.length})`}>App clients</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No app clients</b>
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
