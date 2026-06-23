"use client";

import { useCallback } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import type { LogEvent } from "@/lib/aws/cloudwatch";
import LogEventsPanel from "../LogEventsPanel";
import { searchAllGroupsAction } from "../actions";

export default function AllGroupsSearch({
  initialEvents,
}: {
  initialEvents: LogEvent[];
}) {
  const fetcher = useCallback(
    (startTime?: number) => searchAllGroupsAction("", startTime),
    [],
  );

  return (
    <ContentLayout header={<Header variant="h1">Search all log groups</Header>}>
      <LogEventsPanel initialEvents={initialEvents} fetcher={fetcher} showStream />
    </ContentLayout>
  );
}
