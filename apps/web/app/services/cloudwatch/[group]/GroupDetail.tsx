"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import Link from "@cloudscape-design/components/link";
import Box from "@cloudscape-design/components/box";
import type { LogEvent, LogStream } from "@/lib/aws/cloudwatch";
import { formatBytes } from "@/lib/utils";
import LogEventsView from "../LogEventsView";
import { searchGroupAction } from "../actions";

function formatTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function GroupDetail({
  group,
  streams,
  initialEvents,
}: {
  group: string;
  streams: LogStream[];
  initialEvents: LogEvent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pattern, setPattern] = useState("");
  const [events, setEvents] = useState<LogEvent[]>(initialEvents);

  const streamHref = (stream: string) =>
    `/services/cloudwatch/${encodeURIComponent(group)}/${encodeURIComponent(stream)}`;

  const runSearch = () => {
    startTransition(async () => {
      setEvents(await searchGroupAction(group, pattern));
    });
  };

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              onClick={() => startTransition(() => router.refresh())}
            />
          }
        >
          {group}
        </Header>
      }
    >
      <Tabs
        tabs={[
          {
            id: "streams",
            label: `Log streams (${streams.length})`,
            content: (
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
            ),
          },
          {
            id: "search",
            label: "Search log group",
            content: (
              <SpaceBetween size="m">
                <SpaceBetween size="xs" direction="horizontal">
                  <Input
                    type="search"
                    value={pattern}
                    onChange={({ detail }) => setPattern(detail.value)}
                    placeholder="Filter pattern (e.g. ERROR)"
                  />
                  <Button onClick={runSearch} loading={isPending}>
                    Search
                  </Button>
                </SpaceBetween>
                <LogEventsView events={events} showStream />
              </SpaceBetween>
            ),
          },
        ]}
      />
    </ContentLayout>
  );
}
