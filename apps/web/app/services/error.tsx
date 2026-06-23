"use client";

import ErrorState from "@/components/resources/ErrorState";

export default function ServicesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorState error={error} onRetry={reset} />;
}
