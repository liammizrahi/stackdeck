"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type {
  AccountInformation,
  ContactInformation,
  RegionStatus,
} from "@/lib/aws/account";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function statusBadge(status: string) {
  if (status === "ENABLED_BY_DEFAULT") return <Badge color="blue">Enabled by default</Badge>;
  if (status === "ENABLED") return <Badge color="green">Enabled</Badge>;
  if (status === "DISABLED") return <Badge color="grey">Disabled</Badge>;
  return <Badge color="grey">{status || "—"}</Badge>;
}

export default function AccountView({
  info,
  error,
  contact,
  regions,
}: {
  info: AccountInformation | null;
  error: string | null;
  contact: ContactInformation | null;
  regions: RegionStatus[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(regions, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No regions</b>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No matches</b>
          </Box>
        ),
      },
      pagination: { pageSize: 15 },
      sorting: {},
    });

  const address = contact
    ? [contact.addressLine1, contact.addressLine2, contact.addressLine3]
        .filter(Boolean)
        .join(", ") || "—"
    : "—";

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
          Account
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Account information</Header>}>
          {error || !info ? (
            <Alert type="error" header="Failed to load account information">
              {error ?? "Not available"}
            </Alert>
          ) : (
            <KeyValuePairs
              columns={3}
              items={columnGroups(
                [
                  { label: "Account ID", value: info.accountId || "—" },
                  { label: "Account name", value: info.accountName || "—" },
                  {
                    label: "Account state",
                    value: info.accountState ? (
                      <StatusIndicator
                        type={info.accountState === "ACTIVE" ? "success" : "info"}
                      >
                        {info.accountState}
                      </StatusIndicator>
                    ) : (
                      "—"
                    ),
                  },
                  { label: "Created", value: formatDate(info.createdDate) },
                ],
                3,
              )}
            />
          )}
        </Container>

        <Container header={<Header variant="h2">Contact information</Header>}>
          {contact ? (
            <KeyValuePairs
              columns={3}
              items={columnGroups(
                [
                  { label: "Full name", value: contact.fullName || "—" },
                  { label: "Company", value: contact.companyName || "—" },
                  { label: "Phone number", value: contact.phoneNumber || "—" },
                  { label: "Address", value: address },
                  { label: "City", value: contact.city || "—" },
                  {
                    label: "State or region",
                    value: contact.stateOrRegion || "—",
                  },
                  { label: "Postal code", value: contact.postalCode || "—" },
                  { label: "Country", value: contact.countryCode || "—" },
                ],
                3,
              )}
            />
          ) : (
            <Box color="text-status-inactive">No contact information.</Box>
          )}
        </Container>

        <Table<RegionStatus>
          {...collectionProps}
          variant="container"
          items={items}
          trackBy="name"
          columnDefinitions={[
            {
              id: "name",
              header: "Region",
              sortingField: "name",
              isRowHeader: true,
              cell: (r) => r.name,
            },
            {
              id: "status",
              header: "Opt-in status",
              cell: (r) => statusBadge(r.status),
            },
          ]}
          header={
            <Header counter={`(${regions.length})`}>Regions</Header>
          }
          filter={
            <TextFilter
              {...filterProps}
              filteringPlaceholder="Find regions"
              countText={`${filteredItemsCount} matches`}
            />
          }
          pagination={<Pagination {...paginationProps} />}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
