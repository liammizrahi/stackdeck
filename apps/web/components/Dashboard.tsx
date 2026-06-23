"use client";

import { useEffect, useState } from "react";
import Board from "@cloudscape-design/board-components/board";
import BoardItem from "@cloudscape-design/board-components/board-item";
import type { BoardProps } from "@cloudscape-design/board-components";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useRouter } from "next/navigation";
import ServiceIcon from "@/components/ServiceIcon";
import { services, type ServiceInfo } from "@/lib/services";
import { addRecent, getRecent } from "@/lib/recent";
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
  { id: "recently-visited", rowSpan: 4, columnSpan: 2, data: { title: "Recently visited" } },
  { id: "connection", rowSpan: 2, columnSpan: 2, data: { title: "Connection" } },
  { id: "services", rowSpan: 3, columnSpan: 2, data: { title: "Services" } },
  { id: "welcome", rowSpan: 2, columnSpan: 2, data: { title: "Welcome to StackDeck" } },
  { id: "getting-started", rowSpan: 2, columnSpan: 2, data: { title: "Getting started" } },
];

const storageKey = "stackdeck_board";

const infoLink = (
  <Link variant="info" onFollow={(event) => event.preventDefault()}>
    Info
  </Link>
);

export default function Dashboard({ health }: { health: Health }) {
  const router = useRouter();
  const [items, setItems] = useState<BoardProps.Item<WidgetData>[]>(defaultItems);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecent());
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BoardProps.Item<WidgetData>[];
        const ids = new Set(parsed.map((i) => i.id));
        const missing = defaultItems.filter((d) => !ids.has(d.id));
        setItems([...parsed, ...missing]);
      } catch {
        setItems(defaultItems);
      }
    }
  }, []);

  const persist = (next: readonly BoardProps.Item<WidgetData>[]) => {
    const copy = [...next];
    setItems(copy);
    localStorage.setItem(storageKey, JSON.stringify(copy));
  };

  const removeItem = (id: string) => persist(items.filter((i) => i.id !== id));

  const resetLayout = () => {
    localStorage.removeItem(storageKey);
    setItems(defaultItems);
  };

  const go = (href: string, key?: string) => {
    if (key) addRecent(key);
    router.push(href);
  };

  const serviceRow = (service: ServiceInfo, withDivider: boolean) => (
    <div
      key={service.key}
      className={`sd-service-row${withDivider ? " sd-divider" : ""}`}
    >
      <ServiceIcon service={service.key} size={28} />
      <Link
        href={service.href}
        onFollow={(event) => {
          event.preventDefault();
          go(service.href, service.key);
        }}
      >
        {service.name}
      </Link>
    </div>
  );

  const serviceList = (list: ServiceInfo[]) => {
    const half = Math.ceil(list.length / 2);
    const columns = [list.slice(0, half), list.slice(half)];
    return (
      <div className="sd-service-grid">
        {columns.map((column, columnIndex) => (
          <div className="sd-service-col" key={columnIndex}>
            {column.map((service, rowIndex) =>
              serviceRow(service, rowIndex < column.length - 1),
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = (id: string) => {
    switch (id) {
      case "recently-visited": {
        const recentServices = recent
          .map((key) => services.find((s) => s.key === key))
          .filter((s): s is ServiceInfo => Boolean(s));
        const list = recentServices.length > 0 ? recentServices : services;
        return serviceList(list);
      }
      case "services":
        return serviceList(services);
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
                go("/services/s3", "s3");
              }}
            >
              Browse S3 buckets
            </Link>
            <Link
              href="/services/lambda"
              onFollow={(event) => {
                event.preventDefault();
                go("/services/lambda", "lambda");
              }}
            >
              Inspect Lambda functions
            </Link>
            <Link
              href="/services/dynamodb"
              onFollow={(event) => {
                event.preventDefault();
                go("/services/dynamodb", "dynamodb");
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

  const renderFooter = (id: string) =>
    id === "recently-visited" ? (
      <Box textAlign="center">
        <Link
          onFollow={(event) => {
            event.preventDefault();
            window.dispatchEvent(new Event("stackdeck:open-nav"));
          }}
        >
          View all services
        </Link>
      </Box>
    ) : undefined;

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={infoLink}
          actions={<Button onClick={resetLayout}>Reset to default layout</Button>}
        >
          Console Home
        </Header>
      }
    >
      <Board<WidgetData>
        items={items}
        onItemsChange={(event) => persist(event.detail.items)}
        i18nStrings={boardI18nStrings}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            No widgets. Use “Reset to default layout” to restore them.
          </Box>
        }
        renderItem={(item) => (
          <BoardItem
            i18nStrings={boardItemI18nStrings}
            header={<Header info={infoLink}>{item.data.title}</Header>}
            footer={renderFooter(item.id)}
            settings={
              <ButtonDropdown
                items={[{ id: "remove", text: "Remove from dashboard" }]}
                ariaLabel="Widget settings"
                variant="icon"
                onItemClick={() => removeItem(item.id)}
              />
            }
          >
            {renderContent(item.id)}
          </BoardItem>
        )}
      />
    </ContentLayout>
  );
}
