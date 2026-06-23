"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { IamUser, IamRole, IamPolicy } from "@/lib/aws/iam";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function EmptyState({ label }: { label: string }) {
  return (
    <Box textAlign="center" color="inherit" padding="l">
      <Box variant="strong" color="inherit">
        No {label}
      </Box>
    </Box>
  );
}

function NoMatch() {
  return (
    <Box textAlign="center" color="inherit" padding="l">
      <b>No matches</b>
    </Box>
  );
}

function UsersTab({ users }: { users: IamUser[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { items, collectionProps, filterProps, paginationProps } = useCollection(
    users,
    {
      filtering: {
        empty: <EmptyState label="users" />,
        noMatch: <NoMatch />,
      },
      pagination: { pageSize: 20 },
      sorting: {},
    },
  );

  const refresh = () => startTransition(() => router.refresh());

  return (
    <Table<IamUser>
      {...collectionProps}
      variant="container"
      stickyHeader
      trackBy="id"
      loading={isPending}
      loadingText="Loading users"
      items={items}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (u) => u.name,
        },
        {
          id: "arn",
          header: "ARN",
          cell: (u) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={u.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "created",
          header: "Created",
          sortingField: "created",
          cell: (u) => formatDate(u.created),
        },
      ]}
      header={
        <Header
          counter={`(${users.length})`}
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          Users
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find users"
          filteringAriaLabel="Find users"
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}

function RolesTab({ roles }: { roles: IamRole[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { items, collectionProps, filterProps, paginationProps } = useCollection(
    roles,
    {
      filtering: {
        empty: <EmptyState label="roles" />,
        noMatch: <NoMatch />,
      },
      pagination: { pageSize: 20 },
      sorting: {},
    },
  );

  const refresh = () => startTransition(() => router.refresh());

  return (
    <Table<IamRole>
      {...collectionProps}
      variant="container"
      stickyHeader
      trackBy="id"
      loading={isPending}
      loadingText="Loading roles"
      items={items}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (r) => r.name,
        },
        {
          id: "arn",
          header: "ARN",
          cell: (r) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={r.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "description",
          header: "Description",
          cell: (r) => r.description || "—",
        },
        {
          id: "created",
          header: "Created",
          sortingField: "created",
          cell: (r) => formatDate(r.created),
        },
      ]}
      header={
        <Header
          counter={`(${roles.length})`}
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          Roles
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find roles"
          filteringAriaLabel="Find roles"
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}

function PoliciesTab({ policies }: { policies: IamPolicy[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { items, collectionProps, filterProps, paginationProps } = useCollection(
    policies,
    {
      filtering: {
        empty: <EmptyState label="policies" />,
        noMatch: <NoMatch />,
      },
      pagination: { pageSize: 20 },
      sorting: {},
    },
  );

  const refresh = () => startTransition(() => router.refresh());

  return (
    <Table<IamPolicy>
      {...collectionProps}
      variant="container"
      stickyHeader
      trackBy="id"
      loading={isPending}
      loadingText="Loading policies"
      items={items}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (p) => p.name,
        },
        {
          id: "arn",
          header: "ARN",
          cell: (p) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={p.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "attachmentCount",
          header: "Attachments",
          sortingField: "attachmentCount",
          cell: (p) => p.attachmentCount,
        },
      ]}
      header={
        <Header
          counter={`(${policies.length})`}
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          Policies
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find policies"
          filteringAriaLabel="Find policies"
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}

interface IamViewProps {
  users: IamUser[];
  roles: IamRole[];
  policies: IamPolicy[];
}

export default function IamView({ users, roles, policies }: IamViewProps) {
  return (
    <SpaceBetween size="l">
      <Header variant="h1">IAM</Header>
      <Tabs
        tabs={[
          {
            id: "users",
            label: `Users (${users.length})`,
            content: <UsersTab users={users} />,
          },
          {
            id: "roles",
            label: `Roles (${roles.length})`,
            content: <RolesTab roles={roles} />,
          },
          {
            id: "policies",
            label: `Policies (${policies.length})`,
            content: <PoliciesTab policies={policies} />,
          },
        ]}
      />
    </SpaceBetween>
  );
}
