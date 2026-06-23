"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Parameter } from "@/lib/aws/ssm";
import { putParameterAction } from "./actions";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

const TYPE_OPTIONS = [
  { label: "String", value: "String" },
  { label: "SecureString", value: "SecureString" },
  { label: "StringList", value: "StringList" },
];

export default function ParametersTable({
  parameters,
}: {
  parameters: Parameter[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createValue, setCreateValue] = useState("");
  const [createType, setCreateType] = useState<{
    label: string;
    value: string;
  }>(TYPE_OPTIONS[0]!);
  const [createError, setCreateError] = useState<string | null>(null);

  const { items, collectionProps, filterProps, paginationProps } =
    useCollection(parameters, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <SpaceBetween size="m">
              <Box variant="strong" color="inherit">
                No parameters
              </Box>
              <Button onClick={() => setCreateOpen(true)}>
                Create parameter
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
      pagination: { pageSize: 20 },
      sorting: {},
    });

  const refresh = () => startTransition(() => router.refresh());

  const resetCreateForm = () => {
    setCreateName("");
    setCreateValue("");
    setCreateType(TYPE_OPTIONS[0]!);
    setCreateError(null);
  };

  const submitCreate = () => {
    setCreateError(null);
    startTransition(async () => {
      const result = await putParameterAction(
        createName,
        createValue,
        createType.value,
      );
      if (result.ok) {
        setCreateOpen(false);
        resetCreateForm();
        router.refresh();
      } else {
        setCreateError(result.error ?? "Failed to create parameter");
      }
    });
  };

  return (
    <>
      <Table<Parameter>
        {...collectionProps}
        variant="full-page"
        stickyHeader
        trackBy="name"
        loading={isPending}
        loadingText="Loading parameters"
        items={items}
        columnDefinitions={[
          {
            id: "name",
            header: "Name",
            sortingField: "name",
            isRowHeader: true,
            cell: (param) => (
              <Link
                href={`/services/ssm/${encodeURIComponent(param.name)}`}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(`/services/ssm/${encodeURIComponent(param.name)}`);
                }}
              >
                {param.name}
              </Link>
            ),
          },
          {
            id: "arn",
            header: "ARN",
            cell: (param) => (
              <CopyToClipboard
                variant="inline"
                textToCopy={param.arn}
                copySuccessText="ARN copied"
                copyErrorText="Failed to copy ARN"
              />
            ),
          },
          {
            id: "type",
            header: "Type",
            sortingField: "type",
            cell: (param) => param.type,
          },
          {
            id: "version",
            header: "Version",
            sortingField: "version",
            cell: (param) => param.version,
          },
          {
            id: "lastModifiedDate",
            header: "Last modified",
            sortingField: "lastModifiedDate",
            cell: (param) => formatDate(param.lastModifiedDate),
          },
        ]}
        header={
          <Header
            counter={`(${parameters.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
                <Button
                  variant="primary"
                  onClick={() => {
                    resetCreateForm();
                    setCreateOpen(true);
                  }}
                >
                  Create parameter
                </Button>
              </SpaceBetween>
            }
          >
            Parameters
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find parameters"
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      {mounted && (
        <Modal
          visible={createOpen}
          onDismiss={() => setCreateOpen(false)}
          header="Create parameter"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={isPending}
                  onClick={submitCreate}
                  disabled={!createName || !createValue}
                >
                  Create
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="m">
            {createError && (
              <Alert type="error" header="Could not create parameter">
                {createError}
              </Alert>
            )}
            <FormField label="Name">
              <Input
                value={createName}
                onChange={({ detail }) => setCreateName(detail.value)}
                placeholder="/my/parameter"
              />
            </FormField>
            <FormField label="Type">
              <Select
                selectedOption={createType}
                onChange={({ detail }) =>
                  setCreateType(
                    detail.selectedOption as { label: string; value: string },
                  )
                }
                options={TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="Value">
              <Input
                value={createValue}
                onChange={({ detail }) => setCreateValue(detail.value)}
                type={createType.value === "SecureString" ? "password" : "text"}
                placeholder="Parameter value"
              />
            </FormField>
          </SpaceBetween>
        </Modal>
      )}
    </>
  );
}
