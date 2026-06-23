"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { SqsMessage, SqsQueue, SqsQueueTag } from "@/lib/aws/sqs";
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

  const tags: SqsQueueTag[] = queue.tags ?? [];

  const messagesTab = (
    <SpaceBetween size="m">
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
          <Header
            counter={`(${messages.length})`}
            actions={
              <Button onClick={() => setPurgeOpen(true)}>Purge queue</Button>
            }
          >
            Messages (peek)
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            filteringPlaceholder="Find messages"
            countText={`${filteredItemsCount} matches`}
          />
        }
        pagination={<Pagination {...paginationProps} />}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            <b>No messages</b>
          </Box>
        }
      />
    </SpaceBetween>
  );

  const tagsTab = (
    <Table<SqsQueueTag>
      variant="container"
      trackBy="key"
      items={tags}
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
          cell: (tag) => tag.value,
        },
      ]}
      header={<Header counter={`(${tags.length})`}>Tags</Header>}
      empty={
        <Box textAlign="center" color="inherit" padding="l">
          <b>No tags</b>
        </Box>
      }
    />
  );

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
          {queue.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: "Name", value: queue.name },
              {
                label: "ARN",
                value: (
                  <CopyToClipboard
                    variant="inline"
                    textToCopy={queue.arn}
                    copySuccessText="ARN copied"
                    copyErrorText="Failed to copy ARN"
                  />
                ),
              },
              { label: "Visible messages", value: queue.visible },
              { label: "In flight", value: queue.inflight },
              { label: "Delayed", value: queue.delayed },
              { label: "Visibility timeout (s)", value: queue.visibilityTimeout },
            ]}
          />
        </Container>

        <Tabs
          tabs={[
            { id: "messages", label: "Messages", content: messagesTab },
            { id: "tags", label: "Tags", content: tagsTab },
          ]}
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
