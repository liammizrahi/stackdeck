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
import Tabs from "@cloudscape-design/components/tabs";
import type { LambdaFunctionDetail, LambdaFunctionTag } from "@/lib/aws/lambda";
import { columnGroups } from "@/lib/kv";
import { formatBytes } from "@/lib/utils";

function formatDate(value: string) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function FunctionDetail({
  result,
}: {
  result: { data?: LambdaFunctionDetail; error?: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (result.error) {
    return (
      <ContentLayout header={<Header>Function</Header>}>
        <Alert type="error" header="Failed to load function">
          {result.error}
        </Alert>
      </ContentLayout>
    );
  }

  const fn = result.data;
  if (!fn) {
    return null;
  }

  const envEntries = Object.entries(fn.env).map(([key, value]) => ({ key, value }));

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
          {fn.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups([
              { label: "Runtime", value: fn.runtime || "—" },
              { label: "Handler", value: fn.handler || "—" },
              { label: "Memory (MB)", value: `${fn.memory} MB` },
              { label: "Timeout (s)", value: `${fn.timeout} s` },
              { label: "Code size", value: formatBytes(fn.codeSize) },
              { label: "Last modified", value: formatDate(fn.lastModified) },
              { label: "Description", value: fn.description || "—" },
              {
                label: "ARN",
                value: (
                  <CopyToClipboard
                    variant="inline"
                    textToCopy={fn.arn}
                    copySuccessText="ARN copied"
                    copyErrorText="Failed to copy ARN"
                  />
                ),
              },
            ], 3)}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "env",
              label: "Environment variables",
              content: (
                <Table<{ key: string; value: string }>
                  variant="container"
                  items={envEntries}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (row) => row.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (row) => row.value,
                    },
                  ]}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No environment variables</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "tags",
              label: "Tags",
              content: (
                <Table<LambdaFunctionTag>
                  variant="container"
                  items={fn.tags}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (row) => row.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (row) => row.value,
                    },
                  ]}
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
