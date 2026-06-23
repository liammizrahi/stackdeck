"use client";

import { useState, useTransition } from "react";
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
import type { ParameterTag } from "@/lib/aws/ssm";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function ParameterDetail({
  name,
  arn,
  type,
  version,
  lastModifiedDate,
  value,
  valueError,
  tags,
}: {
  name: string;
  arn: string;
  type: string;
  version: number;
  lastModifiedDate: string | null;
  value: string | null;
  valueError?: string;
  tags: ParameterTag[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState(type !== "SecureString");

  const isSecure = type === "SecureString";

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
          {name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups([
              { label: "Name", value: name },
              { label: "Type", value: type || "—" },
              { label: "Version", value: String(version) },
              {
                label: "ARN",
                value: arn ? (
                  <CopyToClipboard
                    variant="inline"
                    textToCopy={arn}
                    copySuccessText="ARN copied"
                    copyErrorText="Failed to copy ARN"
                  />
                ) : (
                  "—"
                ),
              },
              { label: "Last modified", value: formatDate(lastModifiedDate) },
            ], 3)}
          />
        </Container>

        <Container
          header={
            <Header
              variant="h2"
              actions={
                <Button
                  variant="normal"
                  onClick={() => setRevealed((prev) => !prev)}
                >
                  {revealed ? "Hide" : "Reveal"}
                </Button>
              }
            >
              Value
            </Header>
          }
        >
          {valueError ? (
            <Alert type="error" header="Could not retrieve value">
              {valueError}
            </Alert>
          ) : revealed && value !== null ? (
            <pre className="sd-preview">{value}</pre>
          ) : isSecure && !revealed ? (
            <Box color="text-status-inactive">
              Value hidden. Click &quot;Reveal&quot; to show the decrypted value.
            </Box>
          ) : (
            <Box color="text-status-inactive">No value</Box>
          )}
        </Container>

        <Tabs
          tabs={[
            {
              id: "tags",
              label: "Tags",
              content: (
                <Table<ParameterTag>
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
                      cell: (tag) => tag.value,
                    },
                  ]}
                  header={
                    <Header counter={`(${tags.length})`}>Tags</Header>
                  }
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
