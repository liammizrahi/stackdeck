"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import type { EmailIdentityDetail, EmailIdentityTag } from "@/lib/aws/ses";
import { columnGroups } from "@/lib/kv";

export default function IdentityDetailView({
  identity,
  error,
}: {
  identity: EmailIdentityDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !identity) {
    return (
      <ContentLayout header={<Header variant="h1">Identity</Header>}>
        <Alert type="error" header="Failed to load identity">
          {error ?? "Identity not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    type,
    verified,
    verificationStatus,
    dkimStatus,
    dkimSigningEnabled,
    dkimTokens,
    mailFromDomain,
    feedbackForwarding,
    tags,
  } = identity;

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
                { label: "Identity", value: name },
                { label: "Type", value: type || "—" },
                {
                  label: "Verification status",
                  value: (
                    <StatusIndicator
                      type={
                        verified
                          ? "success"
                          : verificationStatus === "FAILED"
                            ? "error"
                            : "pending"
                      }
                    >
                      {verificationStatus || "—"}
                    </StatusIndicator>
                  ),
                },
                { label: "DKIM status", value: dkimStatus || "—" },
                {
                  label: "DKIM signing",
                  value: dkimSigningEnabled ? "Yes" : "No",
                },
                { label: "MAIL FROM domain", value: mailFromDomain || "—" },
                {
                  label: "Feedback forwarding",
                  value: feedbackForwarding ? "Yes" : "No",
                },
              ],
              3,
            )}
          />
        </Container>

        {tags.length > 0 ? (
          <Table<EmailIdentityTag>
            variant="container"
            items={tags}
            trackBy="key"
            columnDefinitions={[
              {
                id: "key",
                header: "Key",
                isRowHeader: true,
                cell: (t) => t.key,
              },
              {
                id: "value",
                header: "Value",
                cell: (t) => t.value,
              },
            ]}
            header={<Header counter={`(${tags.length})`}>Tags</Header>}
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No tags</b>
              </Box>
            }
          />
        ) : null}

        {dkimTokens.length > 0 ? (
          <Container
            header={
              <Header counter={`(${dkimTokens.length})`}>DKIM tokens</Header>
            }
          >
            <SpaceBetween size="xs">
              {dkimTokens.map((token) => (
                <Box key={token} fontSize="body-s">
                  {token}
                </Box>
              ))}
            </SpaceBetween>
          </Container>
        ) : null}
      </SpaceBetween>
    </ContentLayout>
  );
}
