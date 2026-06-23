"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Textarea from "@cloudscape-design/components/textarea";
import type { SnsSubscription } from "@/lib/aws/sns";
import { publishAction } from "../actions";

export default function TopicDetail({
  name,
  arn,
  subscriptions,
  subscriptionsError,
}: {
  name: string;
  arn: string;
  subscriptions: SnsSubscription[];
  subscriptionsError?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [publishResult, setPublishResult] = useState<{
    ok: boolean;
    error?: string;
    messageId?: string;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handlePublish = () => {
    setPublishResult(null);
    startTransition(async () => {
      const result = await publishAction(arn, message);
      setPublishResult(result);
      if (result.ok) {
        setMessage("");
        router.refresh();
      }
    });
  };

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
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
            columns={2}
            items={[
              { label: "Name", value: name },
              { label: "ARN", value: arn },
            ]}
          />
        </Container>

        <Container header={<Header variant="h2">Publish message</Header>}>
          <SpaceBetween size="m">
            {mounted && publishResult && (
              publishResult.ok ? (
                <Alert type="success" header="Message published">
                  Message ID: {publishResult.messageId}
                </Alert>
              ) : (
                <Alert type="error" header="Failed to publish message">
                  {publishResult.error}
                </Alert>
              )
            )}
            <FormField label="Message">
              <Textarea
                value={message}
                onChange={({ detail }) => setMessage(detail.value)}
                placeholder="Enter message body"
                rows={6}
              />
            </FormField>
            <Box float="right">
              <Button
                variant="primary"
                loading={isPending}
                disabled={message.trim().length === 0}
                onClick={handlePublish}
              >
                Publish
              </Button>
            </Box>
          </SpaceBetween>
        </Container>

        <Table<SnsSubscription>
          variant="container"
          stickyHeader
          items={subscriptions}
          trackBy="subscriptionArn"
          columnDefinitions={[
            {
              id: "protocol",
              header: "Protocol",
              sortingField: "protocol",
              isRowHeader: true,
              cell: (sub) => sub.protocol,
            },
            {
              id: "endpoint",
              header: "Endpoint",
              cell: (sub) => sub.endpoint || "—",
            },
          ]}
          header={
            <Header counter={`(${subscriptions.length})`}>Subscriptions</Header>
          }
          empty={
            subscriptionsError ? (
              <Box textAlign="center" color="inherit" padding="l">
                <Alert type="error">{subscriptionsError}</Alert>
              </Box>
            ) : (
              <Box textAlign="center" color="inherit" padding="l">
                <b>No subscriptions</b>
              </Box>
            )
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
