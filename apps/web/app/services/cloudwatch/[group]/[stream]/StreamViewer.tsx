"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Toggle from "@cloudscape-design/components/toggle";
import type { LogEvent } from "@/lib/aws/cloudwatch";
import LogEventsView from "../../LogEventsView";
import { streamEventsAction } from "../../actions";

export default function StreamViewer({
  group,
  stream,
  initialEvents,
}: {
  group: string;
  stream: string;
  initialEvents: LogEvent[];
}) {
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<LogEvent[]>(initialEvents);
  const [tailing, setTailing] = useState(false);
  const lastEpoch = useRef(
    initialEvents.length ? initialEvents[initialEvents.length - 1]!.epoch : 0,
  );

  useEffect(() => {
    if (!tailing) return;
    const interval = setInterval(async () => {
      const next = await streamEventsAction(group, stream, lastEpoch.current + 1);
      if (next.length > 0) {
        lastEpoch.current = next[next.length - 1]!.epoch;
        setEvents((prev) => [...prev, ...next]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [tailing, group, stream]);

  const refresh = () =>
    startTransition(async () => {
      const fresh = await streamEventsAction(group, stream);
      lastEpoch.current = fresh.length ? fresh[fresh.length - 1]!.epoch : 0;
      setEvents(fresh);
    });

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="s">
              <Toggle
                checked={tailing}
                onChange={({ detail }) => setTailing(detail.checked)}
              >
                Tail
              </Toggle>
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                loading={isPending}
                onClick={refresh}
              />
            </SpaceBetween>
          }
        >
          {stream}
        </Header>
      }
    >
      <LogEventsView events={events} />
    </ContentLayout>
  );
}
