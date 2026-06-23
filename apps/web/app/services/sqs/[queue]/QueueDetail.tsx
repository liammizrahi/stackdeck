"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { SqsMessage, SqsQueue } from "@/lib/aws/sqs";
import { purgeQueueAction } from "../actions";

export default function QueueDetail({
  queue,
  messages,
  messagesError,
}: {
  queue: SqsQueue;
  messages: SqsMessage[];
  messagesError?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(messages, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No messages</b>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No matches</b>
          </Box>
        ),
      },
      pagination: { pageSize: 20 },
      sorting: {},
    });

  const refresh = () => startTransition(() => router.refresh());

  const submitPurge = () => {
    setPurgeError(null);
    startTransition(async () => {
      const result = await purgeQueueAction(queue.url);
      if (result.ok) {
        setPurgeOpen(false);
        router.refresh();
      } else {
        setPurgeError(result.error ?? "Failed to purge queue");
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
              <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
              <Button onClick={() => setPurgeOpen(true)}>Purge queue</Button>
            </SpaceBetween>
          }
        >
          {queue.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Queue attributes</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: "ARN", value: queue.arn || "—" },
              { label: "URL", value: queue.url || "—" },
              { label: "Visible messages", value: queue.visible },
              { label: "In flight", value: queue.inflight },
              { label: "Delayed", value: queue.delayed },
              { label: "Visibility timeout (s)", value: queue.visibilityTimeout },
            ]}
          />
        </Container>

        {messagesError && (
          <Alert type="error" header="Could not load messages">
            {messagesError}
          </Alert>
        )}

        <Table<SqsMessage>
          {...collectionProps}
          variant="container"
          stickyHeader
          loading={isPending}
          loadingText="Loading messages"
          trackBy="messageId"
          items={items}
          columnDefinitions={[
            {
              id: "messageId",
              header: "Message ID",
              sortingField: "messageId",
              isRowHeader: true,
              cell: (msg) => msg.messageId,
            },
            {
              id: "body",
              header: "Body",
              cell: (msg) => msg.body,
            },
          ]}
          header={
            <Header counter={`(${messages.length})`}>Messages (peek)</Header>
          }
          filter={
            <TextFilter
              {...filterProps}
              filteringPlaceholder="Find messages"
              countText={`${filteredItemsCount} matches`}
            />
          }
          pagination={<Pagination {...paginationProps} />}
        />
      </SpaceBetween>

      {mounted && (
        <Modal
          visible={purgeOpen}
          onDismiss={() => setPurgeOpen(false)}
          header="Purge queue"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setPurgeOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={isPending}
                  onClick={submitPurge}
                >
                  Purge
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="m">
            {purgeError && (
              <Alert type="error" header="Could not purge queue">
                {purgeError}
              </Alert>
            )}
            <Box variant="span">
              Permanently delete all messages from <b>{queue.name}</b>? This action cannot be undone.
            </Box>
          </SpaceBetween>
        </Modal>
      )}
    </ContentLayout>
  );
}
