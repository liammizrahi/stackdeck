import BusDetail from "./BusDetail";
import { listRules } from "@/lib/aws/eventbridge";

export const dynamic = "force-dynamic";

export default async function EventBusPage({
  params,
}: {
  params: Promise<{ bus: string }>;
}) {
  const { bus } = await params;
  const name = decodeURIComponent(bus);
  const rules = await listRules(name);
  return <BusDetail bus={name} rules={rules} />;
}
