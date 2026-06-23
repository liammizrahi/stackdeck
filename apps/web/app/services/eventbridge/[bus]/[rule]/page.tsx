import RuleDetail from "./RuleDetail";
import { getRule, listTargets } from "@/lib/aws/eventbridge";

export const dynamic = "force-dynamic";

export default async function EventRulePage({
  params,
}: {
  params: Promise<{ bus: string; rule: string }>;
}) {
  const { bus, rule } = await params;
  const busName = decodeURIComponent(bus);
  const ruleName = decodeURIComponent(rule);
  const [ruleData, targets] = await Promise.all([
    getRule(busName, ruleName),
    listTargets(busName, ruleName),
  ]);
  return <RuleDetail rule={ruleData} targets={targets} />;
}
