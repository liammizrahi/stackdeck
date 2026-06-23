"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import type { EventRule } from "@/lib/aws/eventbridge";

export default function BusDetail({
  bus,
  rules,
}: {
  bus: string;
  rules: EventRule[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const ruleHref = (rule: string) =>
    `/services/eventbridge/${encodeURIComponent(bus)}/${encodeURIComponent(rule)}`;

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
          {bus}
        </Header>
      }
    >
      <Table<EventRule>
        variant="full-page"
        stickyHeader
        items={rules}
        trackBy="name"
        columnDefinitions={[
          {
            id: "name",
            header: "Rule",
            isRowHeader: true,
            cell: (rule) => (
              <Link
                href={ruleHref(rule.name)}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(ruleHref(rule.name));
                }}
              >
                {rule.name}
              </Link>
            ),
          },
          {
            id: "state",
            header: "State",
            cell: (rule) => (
              <StatusIndicator
                type={rule.state === "ENABLED" ? "success" : "stopped"}
              >
                {rule.state || "—"}
              </StatusIndicator>
            ),
          },
          {
            id: "schedule",
            header: "Schedule",
            cell: (rule) => rule.scheduleExpression || "—",
          },
          {
            id: "description",
            header: "Description",
            cell: (rule) => rule.description || "—",
          },
        ]}
        header={<Header counter={`(${rules.length})`}>Rules</Header>}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            <b>No rules</b>
          </Box>
        }
      />
    </ContentLayout>
  );
}
