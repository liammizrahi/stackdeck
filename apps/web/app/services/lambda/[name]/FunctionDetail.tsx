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
import Table from "@cloudscape-design/components/table";
import type { LambdaFunctionDetail } from "@/lib/aws/lambda";
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

  const refresh = () => startTransition(() => router.refresh());

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

  const envEntries = Object.entries(fn.env);

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              loading={isPending}
              onClick={refresh}
            />
          }
        >
          {fn.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Configuration</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: "Runtime", value: fn.runtime || "—" },
              { label: "Handler", value: fn.handler || "—" },
              { label: "Memory", value: `${fn.memory} MB` },
              { label: "Timeout", value: `${fn.timeout} s` },
              { label: "Code size", value: formatBytes(fn.codeSize) },
              { label: "Last modified", value: formatDate(fn.lastModified) },
              {
                label: "Description",
                value: fn.description || "—",
              },
            ]}
          />
        </Container>

        <Table
          variant="container"
          header={
            <Header variant="h2" counter={`(${envEntries.length})`}>
              Environment variables
            </Header>
          }
          items={
            envEntries.length > 0
              ? envEntries.map(([key, value]) => ({ key, value }))
              : []
          }
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>—</b>
            </Box>
          }
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
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
