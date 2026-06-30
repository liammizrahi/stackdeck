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
import type { ImageDetail, RepositoryDetail } from "@/lib/aws/ecr";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatTags(tags: string[]) {
  return tags.length > 0 ? tags.join(", ") : "<untagged>";
}

function shortDigest(digest: string) {
  return digest.length > 19 ? `${digest.slice(0, 19)}…` : digest;
}

function formatSize(sizeBytes: number) {
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function RepositoryDetailView({
  repository,
  error,
}: {
  repository: RepositoryDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !repository) {
    return (
      <ContentLayout header={<Header variant="h1">Repository</Header>}>
        <Alert type="error" header="Failed to load repository">
          {error ?? "Repository not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { name, uri, arn, tagMutability, scanOnPush, createdAt, images } =
    repository;

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
                { label: "Repository name", value: name },
                {
                  label: "URI",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={uri}
                      copySuccessText="URI copied"
                      copyErrorText="Failed to copy URI"
                    />
                  ),
                },
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
                { label: "Tag mutability", value: tagMutability || "—" },
                { label: "Scan on push", value: scanOnPush ? "Yes" : "No" },
                { label: "Created", value: formatDate(createdAt) },
              ],
              3,
            )}
          />
        </Container>

        <Container header={<Header variant="h2">Images</Header>}>
          <Table<ImageDetail>
            variant="container"
            items={images}
            trackBy="digest"
            columnDefinitions={[
              {
                id: "tags",
                header: "Tags",
                cell: (i) => formatTags(i.tags),
              },
              {
                id: "digest",
                header: "Digest",
                isRowHeader: true,
                cell: (i) => shortDigest(i.digest),
              },
              {
                id: "sizeBytes",
                header: "Size",
                cell: (i) => formatSize(i.sizeBytes),
              },
              {
                id: "pushedAt",
                header: "Pushed",
                cell: (i) => formatDate(i.pushedAt),
              },
            ]}
            header={<Header counter={`(${images.length})`}>Images</Header>}
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No images</b>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
