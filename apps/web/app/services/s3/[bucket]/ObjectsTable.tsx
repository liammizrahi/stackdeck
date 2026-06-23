"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Skeleton from "@cloudscape-design/components/skeleton";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { S3Object } from "@/lib/aws/s3";
import { formatBytes } from "@/lib/utils";
import { previewObjectAction } from "../actions";

type Row =
  | { type: "folder"; name: string; prefix: string }
  | { type: "object"; name: string; key: string; size: number; lastModified: string | null };

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function ObjectsTable({
  bucket,
  prefix,
  objects,
  prefixes,
}: {
  bucket: string;
  prefix: string;
  objects: S3Object[];
  prefixes: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewBody, setPreviewBody] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rows: Row[] = [
    ...prefixes.map((p) => ({
      type: "folder" as const,
      name: p.slice(prefix.length).replace(/\/$/, ""),
      prefix: p,
    })),
    ...objects.map((o) => ({
      type: "object" as const,
      name: o.name,
      key: o.key,
      size: o.size,
      lastModified: o.lastModified,
    })),
  ];

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(rows, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No objects</b>
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

  const navigate = (nextPrefix: string) => {
    const query = nextPrefix
      ? `?prefix=${encodeURIComponent(nextPrefix)}`
      : "";
    router.push(`/services/s3/${encodeURIComponent(bucket)}${query}`);
  };

  const openPreview = (key: string) => {
    setPreviewKey(key);
    setPreviewBody("");
    setPreviewError(null);
    setPreviewLoading(true);
    startTransition(async () => {
      const result = await previewObjectAction(bucket, key);
      setPreviewLoading(false);
      if (result.error) setPreviewError(result.error);
      else setPreviewBody(result.body ?? "");
    });
  };

  const segments = prefix.split("/").filter(Boolean);
  const crumbs = [
    { text: bucket, href: "" },
    ...segments.map((seg, index) => ({
      text: seg,
      href: `${segments.slice(0, index + 1).join("/")}/`,
    })),
  ];

  return (
    <SpaceBetween size="m">
      <BreadcrumbGroup
        items={crumbs}
        onFollow={(event) => {
          event.preventDefault();
          navigate(event.detail.href);
        }}
      />
      <Table<Row>
        {...collectionProps}
        variant="container"
        stickyHeader
        loading={isPending && previewKey === null}
        loadingText="Loading objects"
        items={items}
        trackBy="name"
        columnDefinitions={[
          {
            id: "name",
            header: "Name",
            sortingField: "name",
            isRowHeader: true,
            cell: (row) =>
              row.type === "folder" ? (
                <Link
                  href="#"
                  onFollow={(event) => {
                    event.preventDefault();
                    navigate(row.prefix);
                  }}
                >
                  {row.name}/
                </Link>
              ) : (
                <Link
                  href="#"
                  onFollow={(event) => {
                    event.preventDefault();
                    openPreview(row.key);
                  }}
                >
                  {row.name}
                </Link>
              ),
          },
          {
            id: "type",
            header: "Type",
            cell: (row) => (row.type === "folder" ? "Folder" : "Object"),
          },
          {
            id: "lastModified",
            header: "Last modified",
            cell: (row) =>
              row.type === "object" ? formatDate(row.lastModified) : "—",
          },
          {
            id: "size",
            header: "Size",
            cell: (row) => (row.type === "object" ? formatBytes(row.size) : "—"),
          },
        ]}
        header={
          <Header
            counter={`(${rows.length})`}
            actions={
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={() => startTransition(() => router.refresh())}
              />
            }
          >
            {bucket}
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find objects"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      {mounted && (
      <Modal
        visible={previewKey !== null}
        onDismiss={() => setPreviewKey(null)}
        header={previewKey ?? "Preview"}
        size="large"
        footer={
          <Box float="right">
            <Button variant="link" onClick={() => setPreviewKey(null)}>
              Close
            </Button>
          </Box>
        }
      >
        {previewLoading ? (
          <SpaceBetween size="xs">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} width={index % 3 === 2 ? "60%" : "100%"} />
            ))}
          </SpaceBetween>
        ) : previewError ? (
          <Alert type="error">{previewError}</Alert>
        ) : (
          <pre className="sd-preview">{previewBody}</pre>
        )}
      </Modal>
      )}
    </SpaceBetween>
  );
}
