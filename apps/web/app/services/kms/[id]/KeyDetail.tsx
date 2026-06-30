"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { KmsKeyDetail } from "@/lib/aws/kms";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function KeyDetailView({
  keyData,
  error,
}: {
  keyData: KmsKeyDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !keyData) {
    return (
      <ContentLayout header={<Header variant="h1">Key</Header>}>
        <Alert type="error" header="Failed to load key">
          {error ?? "Key not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    keyId,
    arn,
    aliases,
    state,
    keyUsage,
    keySpec,
    origin,
    keyManager,
    multiRegion,
    description,
    creationDate,
  } = keyData;

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              loading={isPending}
              onClick={() => startTransition(() => router.refresh())}
            />
          }
        >
          {keyId}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Key ID", value: keyId },
                {
                  label: "ARN",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ),
                },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator
                      type={
                        state === "Enabled"
                          ? "success"
                          : state === "Disabled"
                            ? "stopped"
                            : "in-progress"
                      }
                    >
                      {state}
                    </StatusIndicator>
                  ),
                },
                {
                  label: "Aliases",
                  value: aliases.length > 0 ? aliases.join(", ") : "—",
                },
                { label: "Description", value: description || "—" },
                { label: "Key usage", value: keyUsage || "—" },
                { label: "Key spec", value: keySpec || "—" },
                { label: "Origin", value: origin || "—" },
                { label: "Key manager", value: keyManager || "—" },
                { label: "Multi-region", value: multiRegion ? "Yes" : "No" },
                { label: "Created", value: formatDate(creationDate) },
              ],
              3,
            )}
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
