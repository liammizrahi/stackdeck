"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import JsonEditor from "@/components/JsonEditor";
import type { SnsSubscription } from "@/lib/aws/sns";
import { publishAction } from "../actions";

export default function TopicDetail({
  name,
  arn,
  subscriptions,
  subscriptionsError,
  tags,
}: {
  name: string;
  arn: string;
  subscriptions: SnsSubscription[];
  subscriptionsError?: string;
  tags: { key: string; value: string }[];
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
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                loading={isPending}
                onClick={() => startTransition(() => router.refresh())}
              />
            </SpaceBetween>
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
            items={[
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
            ]}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "subscriptions",
              label: "Subscriptions",
              content: (
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
                    <Header counter={`(${subscriptions.length})`}>
                      Subscriptions
                    </Header>
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
              ),
            },
            {
              id: "publish",
              label: "Publish message",
              content: (
                <Container>
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
                    <FormField
                      label="Message"
                      description="Enter a JSON or plain-text message body."
                    >
                      {mounted ? (
                        <JsonEditor value={message} onChange={setMessage} />
                      ) : null}
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
              ),
            },
            {
              id: "tags",
              label: "Tags",
              content: (
                <Table<{ key: string; value: string }>
                  variant="container"
                  items={tags}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (tag) => tag.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (tag) => tag.value || "—",
                    },
                  ]}
                  header={<Header counter={`(${tags.length})`}>Tags</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No tags</b>
                    </Box>
                  }
                />
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
