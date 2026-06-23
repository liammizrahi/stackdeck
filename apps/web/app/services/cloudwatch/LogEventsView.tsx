"use client";

import Box from "@cloudscape-design/components/box";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useMemo, useState } from "react";
import type { LogEvent } from "@/lib/aws/cloudwatch";

function formatMessage(message: string): { pretty: string; isJson: boolean } {
  const trimmed = message.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return { pretty: JSON.stringify(JSON.parse(trimmed), null, 2), isJson: true };
    } catch {
      return { pretty: message, isJson: false };
    }
  }
  return { pretty: message, isJson: false };
}

function formatTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function LogEventsView({
  events,
  showStream = false,
}: {
  events: LogEvent[];
  showStream?: boolean;
}) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return q
      ? events.filter((e) => e.message.toLowerCase().includes(q))
      : events;
  }, [events, filter]);

  return (
    <SpaceBetween size="s">
      <Input
        type="search"
        value={filter}
        onChange={({ detail }) => setFilter(detail.value)}
        placeholder="Filter events"
      />
      {filtered.length === 0 ? (
        <Box textAlign="center" color="text-status-inactive" padding="m">
          No log events
        </Box>
      ) : (
        filtered.map((event, index) => {
          const { pretty } = formatMessage(event.message);
          const preview =
            event.message.replace(/\s+/g, " ").slice(0, 140) || "(empty)";
          return (
            <ExpandableSection
              key={`${event.epoch}-${index}`}
              headerText={`${formatTime(event.timestamp)}  ${preview}`}
              variant="container"
            >
              {showStream ? (
                <Box variant="small" color="text-body-secondary">
                  {event.logStreamName}
                </Box>
              ) : null}
              <pre className="sd-preview">{pretty}</pre>
            </ExpandableSection>
          );
        })
      )}
    </SpaceBetween>
  );
}
