"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
import type { BucketTag, S3Object } from "@/lib/aws/s3";
import ObjectsTable from "./ObjectsTable";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function BucketDetail({
  bucket,
  arn,
  region,
  creationDate,
  tags,
  prefix,
  objects,
  prefixes,
}: {
  bucket: string;
  arn: string;
  region: string;
  creationDate: string | null;
  tags: BucketTag[];
  prefix: string;
  objects: S3Object[];
  prefixes: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
          {bucket}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
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
              { label: "AWS Region", value: region },
              { label: "Creation date", value: formatDate(creationDate) },
            ]}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "objects",
              label: "Objects",
              content: (
                <ObjectsTable
                  bucket={bucket}
                  prefix={prefix}
                  objects={objects}
                  prefixes={prefixes}
                />
              ),
            },
            {
              id: "properties",
              label: "Properties",
              content: (
                <SpaceBetween size="l">
                  <Container header={<Header variant="h2">Properties</Header>}>
                    <KeyValuePairs
                      columns={3}
                      items={[
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
                        { label: "AWS Region", value: region },
                        { label: "Creation date", value: formatDate(creationDate) },
                      ]}
                    />
                  </Container>

                  <Table<BucketTag>
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
                </SpaceBetween>
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
