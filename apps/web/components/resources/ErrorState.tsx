"use client";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";

export default function ErrorState({
  error,
  endpoint,
  onRetry,
}: {
  error: { message: string };
  endpoint?: string;
  onRetry?: () => void;
}) {
  const looksLikeConnection =
    /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|Timeout|Networking/i.test(
      error.message,
    );
  return (
    <Alert
      type="error"
      header={
        looksLikeConnection
          ? "Can't reach LocalStack/MiniStack"
          : "Something went wrong"
      }
      action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}
    >
      {looksLikeConnection
        ? `No response from ${endpoint ?? "the configured endpoint"}. Is your local runtime running?`
        : error.message}
    </Alert>
  );
}
