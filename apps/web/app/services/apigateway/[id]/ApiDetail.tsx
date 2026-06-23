"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Container from "@cloudscape-design/components/container";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Api, ApiStage, ApiTag, Route } from "@/lib/aws/apigateway";
import { columnGroups } from "@/lib/kv";

const infoLink = (
  <Link variant="info" onFollow={(event) => event.preventDefault()}>
    Info
  </Link>
);

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "—";
}

function RoutesTab({
  routes,
  error,
  loading,
}: {
  routes: Route[];
  error?: string;
  loading: boolean;
}) {
  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(routes, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No routes</b>
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

  return (
    <SpaceBetween size="m">
      {error && <Alert type="error">{error}</Alert>}
      <Table<Route>
        {...collectionProps}
        variant="container"
        stickyHeader
        loading={loading}
        loadingText="Loading routes"
        items={items}
        trackBy="routeKey"
        columnDefinitions={[
          {
            id: "routeKey",
            header: "Route",
            sortingField: "routeKey",
            isRowHeader: true,
            cell: (route) => route.routeKey,
          },
          { id: "target", header: "Target", cell: (route) => route.target || "—" },
          {
            id: "authorizationType",
            header: "Authorization",
            sortingField: "authorizationType",
            cell: (route) => route.authorizationType || "—",
          },
        ]}
        header={<Header counter={`(${routes.length})`}>Routes</Header>}
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find routes"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </SpaceBetween>
  );
}

function StagesTab({ stages }: { stages: ApiStage[] }) {
  return (
    <Table<ApiStage>
      variant="container"
      items={stages}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Stage",
          isRowHeader: true,
          cell: (stage) => stage.name,
        },
        {
          id: "autoDeploy",
          header: "Auto deploy",
          cell: (stage) => (
            <StatusIndicator type={stage.autoDeploy ? "success" : "stopped"}>
              {stage.autoDeploy ? "Enabled" : "Disabled"}
            </StatusIndicator>
          ),
        },
        {
          id: "description",
          header: "Description",
          cell: (stage) => stage.description || "—",
        },
      ]}
      header={<Header counter={`(${stages.length})`}>Stages</Header>}
      empty={
        <Box textAlign="center" color="inherit" padding="l">
          <b>No stages</b>
        </Box>
      }
    />
  );
}

function TagsTab({ tags }: { tags: ApiTag[] }) {
  return (
    <Table<ApiTag>
      variant="container"
      items={tags}
      trackBy="key"
      columnDefinitions={[
        { id: "key", header: "Key", isRowHeader: true, cell: (tag) => tag.key },
        { id: "value", header: "Value", cell: (tag) => tag.value || "—" },
      ]}
      header={<Header counter={`(${tags.length})`}>Tags</Header>}
      empty={
        <Box textAlign="center" color="inherit" padding="l">
          <b>No tags</b>
        </Box>
      }
    />
  );
}

export default function ApiDetail({
  api,
  apiId,
  routes,
  stages,
  error,
}: {
  api: Api | null;
  apiId: string;
  routes: Route[];
  stages: ApiStage[];
  error?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const arn = api?.arn ?? "";

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                loading={isPending}
                onClick={() => startTransition(() => router.refresh())}
              />
            </SpaceBetween>
          }
        >
          {api?.name ?? apiId}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container
          header={
            <Header variant="h2" info={infoLink}>
              API details
            </Header>
          }
        >
          <KeyValuePairs
            columns={4}
            items={columnGroups(
              [
                { label: "API ID", value: api?.id ?? apiId },
                {
                  label: "ARN",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ),
                },
                { label: "Name", value: api?.name || "—" },
                { label: "API type", value: api?.apiType || "—" },
                { label: "Protocol", value: api?.protocolType || "—" },
                {
                  label: "Gateway version",
                  value: api ? `API Gateway ${api.gatewayVersion}` : "—",
                },
                { label: "Endpoint", value: api?.endpoint || "—" },
                { label: "Created", value: formatDate(api?.createdDate) },
              ],
              4,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "routes",
              label: `Routes (${routes.length})`,
              content: (
                <RoutesTab routes={routes} error={error} loading={isPending} />
              ),
            },
            {
              id: "stages",
              label: `Stages (${stages.length})`,
              content: <StagesTab stages={stages} />,
            },
            {
              id: "tags",
              label: `Tags (${api?.tags.length ?? 0})`,
              content: <TagsTab tags={api?.tags ?? []} />,
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
