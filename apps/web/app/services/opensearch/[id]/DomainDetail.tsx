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
import type { OpenSearchDomainDetail } from "@/lib/aws/opensearch";
import { columnGroups } from "@/lib/kv";

export default function DomainDetailView({
  domain,
  error,
}: {
  domain: OpenSearchDomainDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !domain) {
    return (
      <ContentLayout header={<Header variant="h1">Domain</Header>}>
        <Alert type="error" header="Failed to load domain">
          {error ?? "Domain not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    arn,
    endpoint,
    engineVersion,
    instanceType,
    instanceCount,
    volumeSize,
    zoneAwareness,
    dedicatedMaster,
    processing,
  } = domain;

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
                  label: "Endpoint",
                  value: endpoint ? (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={endpoint}
                      copySuccessText="Endpoint copied"
                      copyErrorText="Failed to copy endpoint"
                    />
                  ) : (
                    "—"
                  ),
                },
                { label: "Engine version", value: engineVersion },
                { label: "Instance type", value: instanceType },
                { label: "Instance count", value: instanceCount },
                { label: "Volume size (GiB)", value: volumeSize },
                { label: "Zone awareness", value: zoneAwareness ? "Yes" : "No" },
                {
                  label: "Dedicated master",
                  value: dedicatedMaster ? "Yes" : "No",
                },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator
                      type={processing ? "in-progress" : "success"}
                    >
                      {processing ? "Processing" : "Active"}
                    </StatusIndicator>
                  ),
                },
              ],
              3,
            )}
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
