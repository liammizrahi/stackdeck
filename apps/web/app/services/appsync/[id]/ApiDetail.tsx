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
import Table from "@cloudscape-design/components/table";
import type { DataSource, GraphqlApiDetail } from "@/lib/aws/appsync";
import { columnGroups } from "@/lib/kv";

export default function ApiDetailView({
  api,
  error,
}: {
  api: GraphqlApiDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !api) {
    return (
      <ContentLayout header={<Header variant="h1">API</Header>}>
        <Alert type="error" header="Failed to load API">
          {error ?? "API not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { apiId, name, authenticationType, arn, endpoint, dataSources } = api;

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
          {name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: name },
                { label: "API ID", value: apiId },
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
                { label: "Authentication", value: authenticationType },
                {
                  label: "GraphQL endpoint",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={endpoint}
                      copySuccessText="Endpoint copied"
                      copyErrorText="Failed to copy endpoint"
                    />
                  ),
                },
              ],
              3,
            )}
          />
        </Container>

        <Table<DataSource>
          variant="container"
          items={dataSources}
          trackBy="name"
          columnDefinitions={[
            {
              id: "name",
              header: "Name",
              isRowHeader: true,
              cell: (d) => d.name,
            },
            {
              id: "type",
              header: "Type",
              cell: (d) => d.type,
            },
            {
              id: "description",
              header: "Description",
              cell: (d) => d.description,
            },
          ]}
          header={
            <Header counter={`(${dataSources.length})`}>Data sources</Header>
          }
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>No data sources</b>
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
