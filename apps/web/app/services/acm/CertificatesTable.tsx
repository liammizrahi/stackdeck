"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { StatusIndicatorProps } from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Certificate } from "@/lib/aws/acm";

export function statusIndicatorType(status: string): StatusIndicatorProps.Type {
  if (status === "ISSUED") return "success";
  if (status === "FAILED" || status === "EXPIRED" || status === "REVOKED") {
    return "error";
  }
  return "pending";
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function CertificatesTable({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(certificates, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No certificates</b>
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

  const href = (arn: string) => `/services/acm/${encodeURIComponent(arn)}`;

  return (
    <Table<Certificate>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading certificates"
      items={items}
      trackBy="arn"
      columnDefinitions={[
        {
          id: "domainName",
          header: "Domain name",
          sortingField: "domainName",
          isRowHeader: true,
          cell: (c) => (
            <Link
              href={href(c.arn)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(c.arn));
              }}
            >
              {c.domainName}
            </Link>
          ),
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (c) => (
            <StatusIndicator type={statusIndicatorType(c.status)}>
              {c.status}
            </StatusIndicator>
          ),
        },
        {
          id: "type",
          header: "Type",
          sortingField: "type",
          cell: (c) => c.type,
        },
        {
          id: "notAfter",
          header: "Expires",
          sortingField: "notAfter",
          cell: (c) => formatDate(c.notAfter),
        },
      ]}
      header={
        <Header
          counter={`(${certificates.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={() => startTransition(() => router.refresh())}
              />
            </SpaceBetween>
          }
        >
          Certificates
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find certificates"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
