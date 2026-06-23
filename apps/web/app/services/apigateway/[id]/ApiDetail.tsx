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
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Api, ApiTag, Route } from "@/lib/aws/apigateway";

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
          {
            id: "target",
            header: "Target",
            cell: (route) => route.target || "—",
          },
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

function TagsTab({ tags }: { tags: ApiTag[] }) {
  return (
    <Table<ApiTag>
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
  );
}

export default function ApiDetail({
  api,
  apiId,
  routes,
  error,
}: {
  api: Api | null;
  apiId: string;
  routes: Route[];
  error?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const arn = api?.arn ?? "";
  const tags = api?.tags ?? [];

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
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: "Name", value: api?.name ?? "—" },
              { label: "Protocol", value: api?.protocolType ?? "—" },
              { label: "Endpoint", value: api?.endpoint || "—" },
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
            ]}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "routes",
              label: "Routes",
              content: (
                <RoutesTab routes={routes} error={error} loading={isPending} />
              ),
            },
            {
              id: "tags",
              label: "Tags",
              content: <TagsTab tags={tags} />,
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
