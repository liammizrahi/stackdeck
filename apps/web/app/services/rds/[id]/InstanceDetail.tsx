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
import Link from "@cloudscape-design/components/link";
import Skeleton from "@cloudscape-design/components/skeleton";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import CodeEditor from "@/components/CodeEditor";
import type { DbInstance } from "@/lib/aws/rds";
import type { DbTable, QueryResult } from "@/lib/aws/rds-db";
import { formatBytes } from "@/lib/utils";
import { columnGroups } from "@/lib/kv";
import { runQueryAction } from "../actions";

function instanceStatus(
  status: string,
): "success" | "error" | "warning" | "pending" | "stopped" | "in-progress" {
  if (status === "available") return "success";
  if (status === "failed" || status === "incompatible-restore") return "error";
  if (status === "stopped" || status === "stopping") return "stopped";
  if (
    status === "creating" ||
    status === "modifying" ||
    status === "starting" ||
    status === "rebooting"
  )
    return "in-progress";
  return "pending";
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

function nullableString(value: string | null | undefined): string {
  return value ?? "—";
}

interface ResultRow {
  id: string;
  cells: string[];
}

function QueryResults({
  result,
  running,
}: {
  result: QueryResult | null;
  running: boolean;
}) {
  if (running) {
    return (
      <SpaceBetween size="xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SpaceBetween>
    );
  }
  if (!result) {
    return (
      <Box color="text-status-inactive" padding={{ top: "s" }}>
        Run a query to see results.
      </Box>
    );
  }
  if (result.error) {
    return (
      <Alert type="error" header="Query failed">
        <pre className="sd-preview">{result.error}</pre>
      </Alert>
    );
  }
  if (result.command) {
    return <Alert type="success">{result.command}</Alert>;
  }
  const rows: ResultRow[] = result.rows.map((cells, i) => ({
    id: String(i),
    cells,
  }));
  return (
    <SpaceBetween size="xs">
      <Table<ResultRow>
        variant="container"
        items={rows}
        trackBy="id"
        resizableColumns
        columnDefinitions={result.columns.map((col, index) => ({
          id: `${col}-${index}`,
          header: col,
          cell: (row: ResultRow) => row.cells[index] ?? "",
        }))}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            <b>No rows</b>
          </Box>
        }
        header={
          <Header counter={`(${result.rowCount})`}>Result</Header>
        }
      />
      {result.truncated ? (
        <Box color="text-status-warning" variant="small">
          Showing the first {result.rowCount} rows.
        </Box>
      ) : null}
    </SpaceBetween>
  );
}

export default function InstanceDetail({
  instance,
  error,
  identifier,
  tables,
}: {
  instance: DbInstance | null;
  error: string | null;
  identifier: string;
  tables: DbTable[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTabId, setActiveTabId] = useState("tables");
  const [sql, setSql] = useState("SELECT 1;");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, startRun] = useTransition();

  const run = (query?: string) => {
    const text = query ?? sql;
    if (query) setSql(query);
    startRun(async () => {
      setResult(await runQueryAction(identifier, text));
    });
  };

  const rowsHref = (table: DbTable) =>
    `/services/rds/${encodeURIComponent(identifier)}/${encodeURIComponent(
      `${table.schema}.${table.name}`,
    )}`;

  if (error || !instance) {
    return (
      <ContentLayout header={<Header variant="h1">DB instance</Header>}>
        <Alert type="error" header="Failed to load DB instance">
          {error ?? "Instance not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const endpointValue = instance.endpointAddress
    ? instance.endpointPort
      ? `${instance.endpointAddress}:${instance.endpointPort}`
      : instance.endpointAddress
    : "—";
  const tags = instance.tags ?? [];

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
          {instance.identifier}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Engine", value: instance.engine },
                {
                  label: "Engine version",
                  value: nullableString(instance.engineVersion),
                },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator type={instanceStatus(instance.status)}>
                      {instance.status}
                    </StatusIndicator>
                  ),
                },
                { label: "Class", value: nullableString(instance.instanceClass) },
                { label: "Endpoint", value: endpointValue },
                { label: "DB name", value: nullableString(instance.dbName) },
                {
                  label: "Master username",
                  value: nullableString(instance.masterUsername),
                },
                {
                  label: "Allocated storage",
                  value:
                    instance.allocatedStorage != null
                      ? `${instance.allocatedStorage} GiB`
                      : "—",
                },
                { label: "Multi-AZ", value: instance.multiAz ? "Yes" : "No" },
                {
                  label: "Availability zone",
                  value: nullableString(instance.availabilityZone),
                },
                { label: "Created", value: formatDate(instance.createTime) },
                {
                  label: "ARN",
                  value: instance.arn ? (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={instance.arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ) : (
                    "—"
                  ),
                },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={[
            {
              id: "tables",
              label: `Tables (${tables.length})`,
              content: (
                <Table<DbTable>
                  variant="container"
                  items={tables}
                  trackBy="name"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Table",
                      isRowHeader: true,
                      cell: (t) => (
                        <Link
                          href={rowsHref(t)}
                          onFollow={(event) => {
                            event.preventDefault();
                            router.push(rowsHref(t));
                          }}
                        >
                          {t.schema}.{t.name}
                        </Link>
                      ),
                    },
                    { id: "rows", header: "Rows", cell: (t) => t.rows },
                    {
                      id: "size",
                      header: "Size",
                      cell: (t) => formatBytes(t.size),
                    },
                  ]}
                  header={<Header counter={`(${tables.length})`}>Tables</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No tables</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "query",
              label: "Query editor",
              content: (
                <SpaceBetween size="m">
                  <CodeEditor value={sql} onChange={setSql} language="sql" />
                  <Box>
                    <Button
                      variant="primary"
                      loading={isRunning}
                      onClick={() => run()}
                    >
                      Run
                    </Button>
                  </Box>
                  <QueryResults result={result} running={isRunning} />
                </SpaceBetween>
              ),
            },
            {
              id: "tags",
              label: `Tags (${tags.length})`,
              content: (
                <Table<{ key: string; value: string }>
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
                    { id: "value", header: "Value", cell: (tag) => tag.value || "—" },
                  ]}
                  header={<Header counter={`(${tags.length})`}>Tags</Header>}
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
