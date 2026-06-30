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
import type { SecretDetail, SecretTag } from "@/lib/aws/secretsmanager";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function SecretDetailView({
  secret,
  error,
}: {
  secret: SecretDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState(false);

  if (error || !secret) {
    return (
      <ContentLayout header={<Header variant="h1">Secret</Header>}>
        <Alert type="error" header="Failed to load secret">
          {error ?? "Secret not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    arn,
    description,
    rotationEnabled,
    createdDate,
    lastChangedDate,
    lastAccessedDate,
    tags,
    value,
    valueError,
  } = secret;

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
                { label: "Description", value: description || "—" },
                {
                  label: "Rotation enabled",
                  value: rotationEnabled ? "Yes" : "No",
                },
                { label: "Created", value: formatDate(createdDate) },
                { label: "Last changed", value: formatDate(lastChangedDate) },
                {
                  label: "Last accessed",
                  value: formatDate(lastAccessedDate),
                },
              ],
              3,
            )}
          />
        </Container>

        <Container
          header={
            <Header
              variant="h2"
              actions={
                <Button onClick={() => setRevealed((prev) => !prev)}>
                  {revealed ? "Hide" : "Reveal"}
                </Button>
              }
            >
              Secret value
            </Header>
          }
        >
          {valueError ? (
            <Alert type="warning" header="Unable to retrieve secret value">
              {valueError}
            </Alert>
          ) : revealed ? (
            <Box variant="code">{value ?? "—"}</Box>
          ) : (
            <Box variant="code">••••••••</Box>
          )}
        </Container>

        {tags.length > 0 && (
          <Table<SecretTag>
            variant="container"
            items={tags}
            trackBy="key"
            columnDefinitions={[
              {
                id: "key",
                header: "Key",
                isRowHeader: true,
                cell: (t) => t.key,
              },
              {
                id: "value",
                header: "Value",
                cell: (t) => t.value,
              },
            ]}
            header={<Header counter={`(${tags.length})`}>Tags</Header>}
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No tags</b>
              </Box>
            }
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
