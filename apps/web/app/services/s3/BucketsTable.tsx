"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Bucket } from "@/lib/aws/s3";
import { createBucketAction, deleteBucketsAction } from "./actions";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function BucketsTable({ buckets }: { buckets: Bucket[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Bucket[]>([]);
  const [isPending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(buckets, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <SpaceBetween size="m">
              <Box variant="strong" color="inherit">
                No buckets
              </Box>
              <Button onClick={() => setCreateOpen(true)}>Create bucket</Button>
            </SpaceBetween>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No matches</b>
          </Box>
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
    });

  const refresh = () => startTransition(() => router.refresh());

  const submitCreate = () => {
    setCreateError(null);
    startTransition(async () => {
      const result = await createBucketAction(newName);
      if (result.ok) {
        setCreateOpen(false);
        setNewName("");
        router.refresh();
      } else {
        setCreateError(result.error ?? "Failed to create bucket");
      }
    });
  };

  const submitDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteBucketsAction(selected.map((b) => b.name));
      if (result.ok) {
        setDeleteOpen(false);
        setSelected([]);
        router.refresh();
      } else {
        setDeleteError(result.error ?? "Failed to delete bucket");
      }
    });
  };

  return (
    <>
      <Table<Bucket>
        {...collectionProps}
        variant="full-page"
        stickyHeader
        selectionType="multi"
        selectedItems={selected}
        onSelectionChange={({ detail }) => setSelected(detail.selectedItems)}
        trackBy="name"
        loading={isPending}
        loadingText="Loading buckets"
        items={items}
        columnDefinitions={[
          {
            id: "name",
            header: "Name",
            sortingField: "name",
            isRowHeader: true,
            cell: (bucket) => (
              <Link
                href={`/services/s3/${encodeURIComponent(bucket.name)}`}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(`/services/s3/${encodeURIComponent(bucket.name)}`);
                }}
              >
                {bucket.name}
              </Link>
            ),
          },
          {
            id: "region",
            header: "AWS Region",
            sortingField: "region",
            cell: (bucket) => bucket.region,
          },
          {
            id: "creationDate",
            header: "Creation date",
            sortingField: "creationDate",
            cell: (bucket) => formatDate(bucket.creationDate),
          },
        ]}
        header={
          <Header
            counter={
              selected.length
                ? `(${selected.length}/${buckets.length})`
                : `(${buckets.length})`
            }
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
                <Button
                  disabled={selected.length === 0}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  Create bucket
                </Button>
              </SpaceBetween>
            }
          >
            Buckets
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find buckets"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      {mounted && (
        <>
      <Modal
        visible={createOpen}
        onDismiss={() => setCreateOpen(false)}
        header="Create bucket"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={isPending}
                disabled={!newName.trim()}
                onClick={submitCreate}
              >
                Create bucket
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          {createError && (
            <Alert type="error" header="Could not create bucket">
              {createError}
            </Alert>
          )}
          <FormField
            label="Bucket name"
            description="Bucket names must be globally unique and DNS-compliant."
          >
            <Input
              value={newName}
              onChange={({ detail }) => setNewName(detail.value)}
              placeholder="my-bucket"
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      <Modal
        visible={deleteOpen}
        onDismiss={() => setDeleteOpen(false)}
        header="Delete buckets"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={isPending} onClick={submitDelete}>
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          {deleteError && (
            <Alert type="error" header="Could not delete bucket">
              {deleteError}
            </Alert>
          )}
          <Box variant="span">
            Permanently delete {selected.length} bucket
            {selected.length === 1 ? "" : "s"}? A bucket must be empty before it
            can be deleted.
          </Box>
        </SpaceBetween>
      </Modal>
        </>
      )}
    </>
  );
}
