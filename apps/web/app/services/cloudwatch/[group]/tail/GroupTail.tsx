"use client";

import { useCallback } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import type { LogEvent } from "@/lib/aws/cloudwatch";
import LogEventsPanel from "../../LogEventsPanel";
import { searchGroupAction } from "../../actions";

export default function GroupTail({
  group,
  initialEvents,
}: {
  group: string;
  initialEvents: LogEvent[];
}) {
  const fetcher = useCallback(
    (startTime?: number) => searchGroupAction(group, "", startTime),
    [group],
  );

  return (
    <ContentLayout header={<Header variant="h1">Live tail</Header>}>
      <LogEventsPanel
        initialEvents={initialEvents}
        fetcher={fetcher}
        enableTail
        defaultTailing
        showStream
      />
    </ContentLayout>
  );
}
