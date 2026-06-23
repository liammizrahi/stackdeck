import BusesTable from "./BusesTable";
import { listEventBuses } from "@/lib/aws/eventbridge";

export const dynamic = "force-dynamic";

export default async function EventBridgePage() {
  const buses = await listEventBuses();
  return <BusesTable buses={buses} />;
}
