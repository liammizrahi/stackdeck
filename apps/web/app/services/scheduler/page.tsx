import SchedulesTable from "./SchedulesTable";
import { listSchedules } from "@/lib/aws/scheduler";

export const dynamic = "force-dynamic";

export default async function SchedulerPage() {
  const schedules = await listSchedules();
  return <SchedulesTable schedules={schedules} />;
}
