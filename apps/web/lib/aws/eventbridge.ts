import {
  EventBridgeClient,
  ListEventBusesCommand,
  ListRulesCommand,
  ListTargetsByRuleCommand,
} from "@aws-sdk/client-eventbridge";
import { clientConfig } from "@/lib/aws/config";

export interface EventBus {
  name: string;
  arn: string;
  ruleCount: number;
}

export interface EventRule {
  name: string;
  arn: string;
  state: string;
  scheduleExpression: string;
  eventPattern: string;
  description: string;
}

export interface EventTarget {
  id: string;
  arn: string;
}

function eventbridgeClient() {
  return new EventBridgeClient(clientConfig());
}

async function ruleCount(
  client: EventBridgeClient,
  busName: string,
): Promise<number> {
  try {
    const out = await client.send(
      new ListRulesCommand({ EventBusName: busName }),
    );
    return (out.Rules ?? []).length;
  } catch {
    return 0;
  }
}

export async function listEventBuses(): Promise<EventBus[]> {
  const client = eventbridgeClient();
  const out = await client.send(new ListEventBusesCommand({}));
  const buses = await Promise.all(
    (out.EventBuses ?? []).map(async (b) => ({
      name: b.Name ?? "",
      arn: b.Arn ?? "",
      ruleCount: await ruleCount(client, b.Name ?? ""),
    })),
  );
  return buses.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listRules(busName: string): Promise<EventRule[]> {
  try {
    const out = await eventbridgeClient().send(
      new ListRulesCommand({ EventBusName: busName }),
    );
    return (out.Rules ?? [])
      .map((r) => ({
        name: r.Name ?? "",
        arn: r.Arn ?? "",
        state: r.State ?? "",
        scheduleExpression: r.ScheduleExpression ?? "",
        eventPattern: r.EventPattern ?? "",
        description: r.Description ?? "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function getRule(
  busName: string,
  ruleName: string,
): Promise<EventRule | null> {
  const rules = await listRules(busName);
  return rules.find((r) => r.name === ruleName) ?? null;
}

export async function listTargets(
  busName: string,
  ruleName: string,
): Promise<EventTarget[]> {
  try {
    const out = await eventbridgeClient().send(
      new ListTargetsByRuleCommand({
        EventBusName: busName,
        Rule: ruleName,
      }),
    );
    return (out.Targets ?? []).map((t) => ({
      id: t.Id ?? "",
      arn: t.Arn ?? "",
    }));
  } catch {
    return [];
  }
}
