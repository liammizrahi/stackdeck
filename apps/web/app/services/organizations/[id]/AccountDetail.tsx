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
import type { OrgAccountDetail } from "@/lib/aws/organizations";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function AccountDetailView({
  account,
  error,
}: {
  account: OrgAccountDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !account) {
    return (
      <ContentLayout header={<Header variant="h1">Account</Header>}>
        <Alert type="error" header="Failed to load account">
          {error ?? "Account not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { id, name, email, status, arn, joinedMethod, joinedAt } = account;

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
          {name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: name },
                { label: "Account ID", value: id },
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
                { label: "Email", value: email },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator
                      type={status === "ACTIVE" ? "success" : "stopped"}
                    >
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Joined method", value: joinedMethod || "—" },
                { label: "Joined", value: formatDate(joinedAt) },
              ],
              3,
            )}
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
