"use client";

import StatusIndicator from "@cloudscape-design/components/status-indicator";

const successStates = ["available", "active", "enabled", "succeeded", "running"];
const errorStates = ["failed", "deleting", "inactive", "error"];

export default function StatusBadge({ status }: { status: string }) {
  const value = (status ?? "").toLowerCase();
  const type = successStates.includes(value)
    ? "success"
    : errorStates.includes(value)
      ? "error"
      : "info";
  return <StatusIndicator type={type}>{status || "unknown"}</StatusIndicator>;
}
