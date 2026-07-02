import ScheduleDetail from "./ScheduleDetail";
import { getSchedule } from "@/lib/aws/scheduler";

export const dynamic = "force-dynamic";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const separator = decoded.lastIndexOf("~");
  const groupName = separator >= 0 ? decoded.slice(0, separator) : "default";
  const name = separator >= 0 ? decoded.slice(separator + 1) : decoded;
  const { schedule, error } = await getSchedule(groupName, name);
  return (
    <ScheduleDetail schedule={schedule ?? null} error={error ?? null} />
  );
}
