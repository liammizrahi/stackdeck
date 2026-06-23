"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Api, Route } from "@/lib/aws/apigateway";

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

  const refresh = () => startTransition(() => router.refresh());

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
    <ContentLayout
      header={
        <Header
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          {api?.name ?? apiId}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={2}
            items={[
              { label: "API ID", value: api?.id ?? apiId },
              { label: "Name", value: api?.name ?? "—" },
              { label: "Protocol", value: api?.protocolType ?? "—" },
              { label: "Endpoint", value: api?.endpoint || "—" },
            ]}
          />
        </Container>

        {error && <Alert type="error">{error}</Alert>}

        <Table<Route>
          {...collectionProps}
          variant="container"
          stickyHeader
          loading={isPending}
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
          header={
            <Header counter={`(${routes.length})`}>Routes</Header>
          }
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
    </ContentLayout>
  );
}
