"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { DbInstance } from "@/lib/aws/rds";
import { deleteDbInstancesAction } from "./actions";

export default function InstancesTable({
  instances,
}: {
  instances: DbInstance[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<DbInstance[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const detailHref = (id: string) => `/services/rds/${encodeURIComponent(id)}`;

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(instances, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <SpaceBetween size="m">
              <b>No DB instances</b>
              <Button onClick={() => router.push("/services/rds/create")}>
                Create database
              </Button>
            </SpaceBetween>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No matches</b>
          </Box>
        ),
      },
      pagination: { pageSize: 12 },
    });

  const refresh = () => startTransition(() => router.refresh());

  const submitDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteDbInstancesAction(
        selected.map((i) => i.identifier),
      );
      if (result.ok) {
        setDeleteOpen(false);
        setSelected([]);
        router.refresh();
      } else {
        setDeleteError(result.error ?? "Failed to delete database");
      }
    });
  };

  return (
    <>
      <Cards<DbInstance>
        {...collectionProps}
        items={items}
        loading={isPending}
        loadingText="Loading DB instances"
        trackBy="identifier"
        selectionType="multi"
        selectedItems={selected}
        onSelectionChange={({ detail }) => setSelected(detail.selectedItems)}
        cardsPerRow={[{ cards: 1 }, { minWidth: 420, cards: 3 }]}
        cardDefinition={{
          header: (instance) => (
            <Link
              fontSize="heading-m"
              href={detailHref(instance.identifier)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(detailHref(instance.identifier));
              }}
            >
              {instance.identifier}
            </Link>
          ),
          sections: [
            {
              id: "engine",
              header: "Engine",
              content: (instance) => instance.engine || "—",
            },
            {
              id: "version",
              header: "Version",
              content: (instance) => instance.engineVersion || "—",
            },
          ],
        }}
        header={
          <Header
            counter={
              selected.length
                ? `(${selected.length}/${instances.length})`
                : `(${instances.length})`
            }
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
                <Button
                  disabled={selected.length !== 1}
                  onClick={() =>
                    selected[0] &&
                    router.push(detailHref(selected[0].identifier))
                  }
                >
                  View details
                </Button>
                <Button
                  disabled={selected.length === 0}
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteOpen(true);
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push("/services/rds/create")}
                >
                  Create database
                </Button>
              </SpaceBetween>
            }
          >
            Databases
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find databases"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      {mounted && (
        <Modal
          visible={deleteOpen}
          onDismiss={() => setDeleteOpen(false)}
          header="Delete databases"
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
              <Alert type="error" header="Could not delete database">
                {deleteError}
              </Alert>
            )}
            <Box variant="span">
              Permanently delete {selected.length} database
              {selected.length === 1 ? "" : "s"}? This removes the instance and its
              data.
            </Box>
          </SpaceBetween>
        </Modal>
      )}
    </>
  );
}
