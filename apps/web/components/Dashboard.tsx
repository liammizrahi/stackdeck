"use client";

import { useEffect, useState } from "react";
import Board from "@cloudscape-design/board-components/board";
import BoardItem from "@cloudscape-design/board-components/board-item";
import type { BoardProps } from "@cloudscape-design/board-components";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useRouter } from "next/navigation";
import ServiceIcon from "@/components/ServiceIcon";
import { services } from "@/lib/services";
import {
  boardI18nStrings,
  boardItemI18nStrings,
  type WidgetData,
} from "@/lib/board-i18n";

interface Health {
  connected: boolean;
  account: string | null;
  endpoint: string;
  region: string;
}

const defaultItems: BoardProps.Item<WidgetData>[] = [
  { id: "services", rowSpan: 3, columnSpan: 2, data: { title: "Services" } },
  { id: "connection", rowSpan: 3, columnSpan: 2, data: { title: "Connection" } },
  { id: "welcome", rowSpan: 2, columnSpan: 2, data: { title: "Welcome to StackDeck" } },
  { id: "getting-started", rowSpan: 2, columnSpan: 2, data: { title: "Getting started" } },
];

const storageKey = "stackdeck_board";

export default function Dashboard({ health }: { health: Health }) {
  const router = useRouter();
  const [items, setItems] = useState<BoardProps.Item<WidgetData>[]>(defaultItems);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved) as BoardProps.Item<WidgetData>[]);
      } catch {
        setItems(defaultItems);
      }
    }
  }, []);

  const handleChange = (next: readonly BoardProps.Item<WidgetData>[]) => {
    const copy = [...next];
    setItems(copy);
    localStorage.setItem(storageKey, JSON.stringify(copy));
  };

  const go = (href: string) => router.push(href);

  const renderContent = (id: string) => {
    switch (id) {
      case "services":
        return (
          <ColumnLayout columns={2}>
            {services.map((service) => (
              <Link
                key={service.key}
                href={service.href}
                onFollow={(event) => {
                  event.preventDefault();
                  go(service.href);
                }}
              >
                <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                  <ServiceIcon service={service.key} size={24} />
                  <span>{service.name}</span>
                </SpaceBetween>
              </Link>
            ))}
          </ColumnLayout>
        );
      case "connection":
        return (
          <SpaceBetween size="m">
            <StatusIndicator type={health.connected ? "success" : "error"}>
              {health.connected ? "Connected" : "Disconnected"}
            </StatusIndicator>
            <KeyValuePairs
              items={[
                { label: "Endpoint", value: health.endpoint },
                { label: "Region", value: health.region },
                { label: "Account", value: health.account ?? "—" },
              ]}
            />
          </SpaceBetween>
        );
      case "welcome":
        return (
          <SpaceBetween size="s">
            <Box variant="p">
              StackDeck is a local AWS console for LocalStack and MiniStack. Browse
              and manage your local cloud resources with a familiar interface.
            </Box>
            <Link external href="https://docs.localstack.cloud">
              LocalStack documentation
            </Link>
          </SpaceBetween>
        );
      case "getting-started":
        return (
          <SpaceBetween size="xs">
            <Link
              href="/services/s3"
              onFollow={(event) => {
                event.preventDefault();
                go("/services/s3");
              }}
            >
              Browse S3 buckets
            </Link>
            <Link
              href="/services/lambda"
              onFollow={(event) => {
                event.preventDefault();
                go("/services/lambda");
              }}
            >
              Inspect Lambda functions
            </Link>
            <Link
              href="/services/dynamodb"
              onFollow={(event) => {
                event.preventDefault();
                go("/services/dynamodb");
              }}
            >
              Query DynamoDB tables
            </Link>
          </SpaceBetween>
        );
      default:
        return null;
    }
  };

  return (
    <ContentLayout header={<Header variant="h1">Console Home</Header>}>
      <Board<WidgetData>
        items={items}
        onItemsChange={(event) => handleChange(event.detail.items)}
        i18nStrings={boardI18nStrings}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            No widgets
          </Box>
        }
        renderItem={(item) => (
          <BoardItem
            i18nStrings={boardItemI18nStrings}
            header={
              <Header
                info={
                  <Link variant="info" onFollow={(event) => event.preventDefault()}>
                    Info
                  </Link>
                }
              >
                {item.data.title}
              </Header>
            }
          >
            {renderContent(item.id)}
          </BoardItem>
        )}
      />
    </ContentLayout>
  );
}
