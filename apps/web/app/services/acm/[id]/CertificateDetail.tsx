"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import type { CertificateDetail } from "@/lib/aws/acm";
import { columnGroups } from "@/lib/kv";
import { statusIndicatorType } from "../CertificatesTable";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

interface San {
  name: string;
}

interface InUse {
  arn: string;
}

export default function CertificateDetailView({
  certificate,
  error,
}: {
  certificate: CertificateDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !certificate) {
    return (
      <ContentLayout header={<Header variant="h1">Certificate</Header>}>
        <Alert type="error" header="Failed to load certificate">
          {error ?? "Certificate not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    arn,
    domainName,
    status,
    type,
    subjectAlternativeNames,
    issuer,
    keyAlgorithm,
    notBefore,
    notAfter,
    renewalEligibility,
    inUseBy,
  } = certificate;

  const sans: San[] = subjectAlternativeNames.map((name) => ({ name }));
  const inUse: InUse[] = inUseBy.map((a) => ({ arn: a }));

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
          {domainName}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Domain name", value: domainName },
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
                    <StatusIndicator type={statusIndicatorType(status)}>
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Type", value: type || "—" },
                { label: "Issuer", value: issuer || "—" },
                { label: "Key algorithm", value: keyAlgorithm || "—" },
                { label: "Issued", value: formatDate(notBefore) },
                { label: "Expires", value: formatDate(notAfter) },
                {
                  label: "Renewal eligibility",
                  value: renewalEligibility || "—",
                },
              ],
              3,
            )}
          />
        </Container>

        {sans.length > 0 && (
          <Container
            header={
              <Header counter={`(${sans.length})`}>
                Subject alternative names
              </Header>
            }
          >
            <Table<San>
              variant="borderless"
              items={sans}
              trackBy="name"
              columnDefinitions={[
                {
                  id: "name",
                  header: "Domain",
                  isRowHeader: true,
                  cell: (s) => s.name,
                },
              ]}
              empty={
                <Box textAlign="center" color="inherit" padding="l">
                  <b>No subject alternative names</b>
                </Box>
              }
            />
          </Container>
        )}

        {inUse.length > 0 && (
          <Container
            header={<Header counter={`(${inUse.length})`}>In use by</Header>}
          >
            <Table<InUse>
              variant="borderless"
              items={inUse}
              trackBy="arn"
              columnDefinitions={[
                {
                  id: "arn",
                  header: "ARN",
                  isRowHeader: true,
                  cell: (i) => i.arn,
                },
              ]}
              empty={
                <Box textAlign="center" color="inherit" padding="l">
                  <b>Not in use</b>
                </Box>
              }
            />
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
