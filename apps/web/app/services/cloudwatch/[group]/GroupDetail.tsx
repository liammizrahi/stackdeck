"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import type { LogStream } from "@/lib/aws/cloudwatch";
import { formatBytes } from "@/lib/utils";

function formatTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function GroupDetail({
  group,
  streams,
}: {
  group: string;
  streams: LogStream[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const base = `/services/cloudwatch/${encodeURIComponent(group)}`;

  const streamHref = (stream: string) => `${base}/${encodeURIComponent(stream)}`;

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => router.push(`${base}/search`)}>
                Search all log streams
              </Button>
              <Button
                variant="normal"
                iconName="status-positive"
                onClick={() => router.push(`${base}/tail`)}
              >
                Start tailing
              </Button>
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                loading={isPending}
                onClick={() => startTransition(() => router.refresh())}
              />
            </SpaceBetween>
          }
        >
          {group}
        </Header>
      }
    >
      <Table<LogStream>
        variant="container"
        stickyHeader
        items={streams}
        trackBy="name"
        columnDefinitions={[
          {
            id: "name",
            header: "Log stream",
            isRowHeader: true,
            cell: (s) => (
              <Link
                href={streamHref(s.name)}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(streamHref(s.name));
                }}
              >
                {s.name}
              </Link>
            ),
          },
          {
            id: "lastEvent",
            header: "Last event time",
            cell: (s) => formatTime(s.lastEventTime),
          },
          {
            id: "size",
            header: "Stored size",
            cell: (s) => formatBytes(s.storedBytes),
          },
        ]}
        header={<Header counter={`(${streams.length})`}>Log streams</Header>}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            <b>No log streams</b>
          </Box>
        }
      />
    </ContentLayout>
  );
}
