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
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { AccountInfo, EmailIdentity } from "@/lib/aws/ses";

export default function IdentitiesTable({
  identities,
  account,
}: {
  identities: EmailIdentity[];
  account: AccountInfo | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(identities, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No identities</b>
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

  const href = (name: string) => `/services/ses/${encodeURIComponent(name)}`;

  return (
    <SpaceBetween size="s">
      {account ? (
        <Box variant="awsui-key-label">
          Sent {account.sentLast24Hours}/{account.max24HourSend} in last 24h
        </Box>
      ) : null}
      <Table<EmailIdentity>
        {...collectionProps}
        variant="full-page"
        stickyHeader
        loading={isPending}
        loadingText="Loading identities"
        items={items}
        trackBy="name"
        columnDefinitions={[
          {
            id: "name",
            header: "Identity",
            sortingField: "name",
            isRowHeader: true,
            cell: (i) => (
              <Link
                href={href(i.name)}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(href(i.name));
                }}
              >
                {i.name}
              </Link>
            ),
          },
          {
            id: "type",
            header: "Type",
            sortingField: "type",
            cell: (i) => i.type,
          },
          {
            id: "verification",
            header: "Verification",
            cell: (i) => (
              <StatusIndicator
                type={
                  i.verified
                    ? "success"
                    : i.verificationStatus === "FAILED"
                      ? "error"
                      : "pending"
                }
              >
                {i.verificationStatus || "—"}
              </StatusIndicator>
            ),
          },
          {
            id: "sending",
            header: "Sending",
            cell: (i) => (
              <StatusIndicator type={i.sendingEnabled ? "success" : "stopped"}>
                {i.sendingEnabled ? "Enabled" : "Disabled"}
              </StatusIndicator>
            ),
          },
        ]}
        header={
          <Header
            counter={`(${identities.length})`}
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
            Identities
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find identities"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </SpaceBetween>
  );
}
