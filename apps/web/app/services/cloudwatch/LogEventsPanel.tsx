"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import DateRangePicker, {
  type DateRangePickerProps,
} from "@cloudscape-design/components/date-range-picker";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import SegmentedControl from "@cloudscape-design/components/segmented-control";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Toggle from "@cloudscape-design/components/toggle";
import type { LogEvent } from "@/lib/aws/cloudwatch";
import { dateRangeI18nStrings, rangeToStartTime } from "@/lib/date-range-i18n";

interface EventRow extends LogEvent {
  id: string;
}

const presetMs: Record<string, number> = {
  "1m": 60_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "12h": 43_200_000,
};

function withIds(events: LogEvent[]): EventRow[] {
  return events.map((e, i) => ({ ...e, id: `${e.epoch}-${i}-${e.logStreamName}` }));
}

function formatTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function prettyMessage(message: string): string {
  const trimmed = message.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return message;
    }
  }
  return message;
}

export default function LogEventsPanel({
  initialEvents,
  fetcher,
  enableTail = false,
  defaultTailing = false,
  showStream = false,
}: {
  initialEvents: LogEvent[];
  fetcher: (startTime?: number) => Promise<LogEvent[]>;
  enableTail?: boolean;
  defaultTailing?: boolean;
  showStream?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<EventRow[]>(withIds(initialEvents));
  const [filter, setFilter] = useState("");
  const [preset, setPreset] = useState("");
  const [customRange, setCustomRange] =
    useState<DateRangePickerProps.Value | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [tailing, setTailing] = useState(defaultTailing);
  const lastEpoch = useRef(
    initialEvents.length ? initialEvents[initialEvents.length - 1]!.epoch : 0,
  );

  const reload = useCallback(
    (startTime?: number) => {
      startTransition(async () => {
        const next = await fetcher(startTime);
        setEvents(withIds(next));
        lastEpoch.current = next.length ? next[next.length - 1]!.epoch : 0;
      });
    },
    [fetcher],
  );

  useEffect(() => {
    if (!tailing) return;
    const interval = setInterval(async () => {
      const next = await fetcher(lastEpoch.current + 1);
      if (next.length > 0) {
        lastEpoch.current = next[next.length - 1]!.epoch;
        setEvents((prev) => [...prev, ...withIds(next)]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [tailing, fetcher]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return q ? events.filter((e) => e.message.toLowerCase().includes(q)) : events;
  }, [events, filter]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectPreset = (id: string) => {
    setPreset(id);
    setCustomRange(null);
    reload(Date.now() - (presetMs[id] ?? 0));
  };

  return (
    <Table<EventRow>
      variant="container"
      stickyHeader
      loading={isPending}
      loadingText="Loading log events"
      items={filtered}
      trackBy="id"
      wrapLines
      columnDefinitions={[
        {
          id: "expand",
          header: "",
          width: 44,
          minWidth: 44,
          cell: (row) => (
            <Button
              variant="inline-icon"
              ariaLabel={expanded.has(row.id) ? "Collapse" : "Expand"}
              iconName={
                expanded.has(row.id) ? "treeview-collapse" : "treeview-expand"
              }
              onClick={() => toggle(row.id)}
            />
          ),
        },
        {
          id: "timestamp",
          header: "Timestamp",
          width: 220,
          cell: (row) => formatTime(row.timestamp),
        },
        {
          id: "message",
          header: "Message",
          cell: (row) =>
            expanded.has(row.id) ? (
              <SpaceBetween size="xxs">
                {showStream ? (
                  <Box variant="small" color="text-body-secondary">
                    {row.logStreamName}
                  </Box>
                ) : null}
                <pre className="sd-preview">{prettyMessage(row.message)}</pre>
              </SpaceBetween>
            ) : (
              <Box variant="samp">
                {row.message.replace(/\s+/g, " ").slice(0, 200) || "(empty)"}
              </Box>
            ),
        },
      ]}
      header={
        <Header
          counter={`(${filtered.length})`}
          description="Use the filter bar to match terms in your log events. Choose a time range to load events."
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {enableTail ? (
                <Toggle
                  checked={tailing}
                  onChange={({ detail }) => setTailing(detail.checked)}
                >
                  Tail
                </Toggle>
              ) : null}
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={() =>
                  reload(
                    customRange
                      ? rangeToStartTime(customRange)
                      : preset
                        ? Date.now() - (presetMs[preset] ?? 0)
                        : undefined,
                  )
                }
              />
            </SpaceBetween>
          }
        >
          Log events
        </Header>
      }
      filter={
        <div className="sd-log-toolbar">
          <Input
            type="search"
            value={filter}
            onChange={({ detail }) => setFilter(detail.value)}
            placeholder="Filter events"
          />
          <SegmentedControl
            selectedId={preset}
            onChange={({ detail }) => selectPreset(detail.selectedId)}
            label="Time range"
            options={[
              { id: "1m", text: "1m" },
              { id: "30m", text: "30m" },
              { id: "1h", text: "1h" },
              { id: "12h", text: "12h" },
            ]}
          />
          <DateRangePicker
            value={customRange}
            onChange={({ detail }) => {
              setCustomRange(detail.value);
              setPreset("");
              reload(rangeToStartTime(detail.value));
            }}
            relativeOptions={[]}
            rangeSelectorMode="absolute-only"
            i18nStrings={dateRangeI18nStrings}
            placeholder="Custom"
            isValidRange={() => ({ valid: true })}
          />
        </div>
      }
      empty={
        <Box textAlign="center" color="inherit" padding="l">
          <b>No log events</b>
        </Box>
      }
    />
  );
}
