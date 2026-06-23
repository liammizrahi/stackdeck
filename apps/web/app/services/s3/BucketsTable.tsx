"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import PropertyFilter, {
  type PropertyFilterProps,
} from "@cloudscape-design/components/property-filter";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import type { Bucket } from "@/lib/aws/s3";
import { deleteBucketsAction } from "./actions";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

const filteringProperties: PropertyFilterProps.FilteringProperty[] = [
  {
    key: "name",
    propertyLabel: "Name",
    groupValuesLabel: "Name values",
    operators: [":", "!:", "=", "!="],
  },
  {
    key: "region",
    propertyLabel: "AWS Region",
    groupValuesLabel: "Region values",
    operators: ["=", "!=", ":", "!:"],
  },
  {
    key: "arn",
    propertyLabel: "ARN",
    groupValuesLabel: "ARN values",
    operators: [":", "!:"],
  },
];

const propertyFilterI18n: PropertyFilterProps.I18nStrings = {
  filteringAriaLabel: "Find buckets",
  filteringPlaceholder: "Find buckets",
  dismissAriaLabel: "Dismiss",
  groupValuesText: "Values",
  groupPropertiesText: "Properties",
  operatorsText: "Operators",
  operationAndText: "and",
  operationOrText: "or",
  operatorLessText: "Less than",
  operatorLessOrEqualText: "Less than or equal",
  operatorGreaterText: "Greater than",
  operatorGreaterOrEqualText: "Greater than or equal",
  operatorContainsText: "Contains",
  operatorDoesNotContainText: "Does not contain",
  operatorEqualsText: "Equals",
  operatorDoesNotEqualText: "Does not equal",
  editTokenHeader: "Edit filter",
  propertyText: "Property",
  operatorText: "Operator",
  valueText: "Value",
  cancelActionText: "Cancel",
  applyActionText: "Apply",
  allPropertiesLabel: "All properties",
  tokenLimitShowMore: "Show more",
  tokenLimitShowFewer: "Show fewer",
  clearFiltersText: "Clear filters",
  removeTokenButtonAriaLabel: () => "Remove token",
  enteredTextLabel: (text) => `Use: "${text}"`,
};

export default function BucketsTable({ buckets }: { buckets: Bucket[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Bucket[]>([]);
  const [isPending, startTransition] = useTransition();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const openCreate = () => router.push("/services/s3/create");

  const { items, collectionProps, propertyFilterProps, paginationProps } =
    useCollection(buckets, {
      propertyFiltering: {
        filteringProperties,
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <SpaceBetween size="m">
              <Box variant="strong" color="inherit">
                No buckets
              </Box>
              <Button onClick={openCreate}>Create bucket</Button>
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
            id: "arn",
            header: "ARN",
            cell: (bucket) => (
              <CopyToClipboard
                variant="inline"
                textToCopy={bucket.arn}
                copySuccessText="ARN copied"
                copyErrorText="Failed to copy ARN"
              />
            ),
          },
          {
            id: "region",
            header: "AWS Region",
            sortingField: "region",
            cell: (bucket) => bucket.region,
          },
          {
            id: "tags",
            header: "Tags",
            cell: (bucket) =>
              bucket.tags.length === 0 ? (
                "—"
              ) : (
                <SpaceBetween direction="horizontal" size="xxs">
                  {bucket.tags.map((tag) => (
                    <Badge key={tag.key}>
                      {tag.key}: {tag.value}
                    </Badge>
                  ))}
                </SpaceBetween>
              ),
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
                <Button variant="primary" onClick={openCreate}>
                  Create bucket
                </Button>
              </SpaceBetween>
            }
          >
            Buckets
          </Header>
        }
        filter={
          <PropertyFilter
            {...propertyFilterProps}
            i18nStrings={propertyFilterI18n}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      {mounted && (
        <>
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
                  <Button
                    variant="primary"
                    loading={isPending}
                    onClick={submitDelete}
                  >
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
                {selected.length === 1 ? "" : "s"}? A bucket must be empty before
                it can be deleted.
              </Box>
            </SpaceBetween>
          </Modal>
        </>
      )}
    </>
  );
}
