"use client";

import { useEffect, useState, useTransition } from "react";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import type { DbColumn, QueryResult } from "@/lib/aws/rds-db";
import {
  deleteRowAction,
  getRowsAction,
  insertRowAction,
  updateRowAction,
} from "../../actions";

interface Row {
  id: string;
  cells: string[];
}

function toRows(result: QueryResult): Row[] {
  return result.rows.map((cells, i) => ({ id: String(i), cells }));
}

export default function RowsExplorer({
  identifier,
  schema,
  table,
  columns,
  primaryKey,
  initial,
}: {
  identifier: string;
  schema: string;
  table: string;
  columns: DbColumn[];
  primaryKey: string[];
  initial: QueryResult;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<QueryResult>(initial);
  const [selected, setSelected] = useState<Row[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const hasPk = primaryKey.length > 0;
  const colIndex = (name: string) => result.columns.indexOf(name);

  const refresh = () =>
    startTransition(async () => {
      const next = await getRowsAction(identifier, schema, table);
      setResult(next);
      setSelected([]);
    });

  const keyOf = (row: Row): Record<string, string> => {
    const key: Record<string, string> = {};
    for (const pk of primaryKey) {
      const idx = colIndex(pk);
      key[pk] = idx >= 0 ? (row.cells[idx] ?? "") : "";
    }
    return key;
  };

  const openAdd = () => {
    setForm(Object.fromEntries(columns.map((c) => [c.name, ""])));
    setActionError(null);
    setAddOpen(true);
  };

  const openEdit = () => {
    const row = selected[0];
    if (!row) return;
    setForm(
      Object.fromEntries(
        columns.map((c) => [c.name, row.cells[colIndex(c.name)] ?? ""]),
      ),
    );
    setActionError(null);
    setEditOpen(true);
  };

  const submitAdd = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await insertRowAction(identifier, schema, table, form);
      if (res.error) {
        setActionError(res.error);
      } else {
        setAddOpen(false);
        refresh();
      }
    });
  };

  const submitEdit = () => {
    const row = selected[0];
    if (!row) return;
    const values = Object.fromEntries(
      columns.filter((c) => !primaryKey.includes(c.name)).map((c) => [
        c.name,
        form[c.name] ?? "",
      ]),
    );
    setActionError(null);
    startTransition(async () => {
      const res = await updateRowAction(
        identifier,
        schema,
        table,
        keyOf(row),
        values,
      );
      if (res.error) {
        setActionError(res.error);
      } else {
        setEditOpen(false);
        refresh();
      }
    });
  };

  const submitDelete = () => {
    const row = selected[0];
    if (!row) return;
    setActionError(null);
    startTransition(async () => {
      const res = await deleteRowAction(identifier, schema, table, keyOf(row));
      if (res.error) {
        setActionError(res.error);
      } else {
        setDeleteOpen(false);
        refresh();
      }
    });
  };

  const fieldList = (excludePk: boolean) =>
    columns
      .filter((c) => !excludePk || !primaryKey.includes(c.name))
      .map((c) => (
        <FormField
          key={c.name}
          label={c.name}
          description={c.dataType}
        >
          <Input
            value={form[c.name] ?? ""}
            onChange={({ detail }) =>
              setForm((prev) => ({ ...prev, [c.name]: detail.value }))
            }
            placeholder={c.nullable ? "NULL" : ""}
          />
        </FormField>
      ));

  return (
    <ContentLayout header={<Header variant="h1">{schema}.{table}</Header>}>
      <SpaceBetween size="l">
        {!hasPk && (
          <Alert type="info">
            This table has no primary key. Rows can be added but not edited or
            deleted.
          </Alert>
        )}
        {result.error && (
          <Alert type="error" header="Query failed">
            {result.error}
          </Alert>
        )}
        <Table<Row>
          variant="full-page"
          stickyHeader
          loading={isPending}
          loadingText="Loading rows"
          items={toRows(result)}
          trackBy="id"
          resizableColumns
          selectionType="single"
          selectedItems={selected}
          onSelectionChange={({ detail }) => setSelected(detail.selectedItems)}
          columnDefinitions={result.columns.map((col, index) => ({
            id: `${col}-${index}`,
            header: col,
            cell: (row: Row) => row.cells[index] ?? "",
          }))}
          header={
            <Header
              counter={`(${result.rowCount})`}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
                  <Button
                    disabled={!hasPk || selected.length === 0}
                    onClick={() => {
                      setActionError(null);
                      setDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    disabled={!hasPk || selected.length === 0}
                    onClick={openEdit}
                  >
                    Edit
                  </Button>
                  <Button variant="primary" onClick={openAdd}>
                    Add row
                  </Button>
                </SpaceBetween>
              }
            >
              Rows
            </Header>
          }
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>No rows</b>
            </Box>
          }
        />
      </SpaceBetween>

      {mounted && (
        <>
          <Modal
            visible={addOpen}
            onDismiss={() => setAddOpen(false)}
            header="Add row"
            size="medium"
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    loading={isPending}
                    onClick={submitAdd}
                  >
                    Add
                  </Button>
                </SpaceBetween>
              </Box>
            }
          >
            <SpaceBetween size="m">
              {actionError && <Alert type="error">{actionError}</Alert>}
              {fieldList(false)}
            </SpaceBetween>
          </Modal>

          <Modal
            visible={editOpen}
            onDismiss={() => setEditOpen(false)}
            header="Edit row"
            size="medium"
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    loading={isPending}
                    onClick={submitEdit}
                  >
                    Save changes
                  </Button>
                </SpaceBetween>
              </Box>
            }
          >
            <SpaceBetween size="m">
              {actionError && <Alert type="error">{actionError}</Alert>}
              {fieldList(true)}
            </SpaceBetween>
          </Modal>

          <Modal
            visible={deleteOpen}
            onDismiss={() => setDeleteOpen(false)}
            header="Delete row"
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
              {actionError && <Alert type="error">{actionError}</Alert>}
              <Box variant="span">Permanently delete the selected row?</Box>
            </SpaceBetween>
          </Modal>
        </>
      )}
    </ContentLayout>
  );
}
