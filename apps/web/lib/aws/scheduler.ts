import {
  GetScheduleCommand,
  ListSchedulesCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import { clientConfig } from "@/lib/aws/config";

export interface Schedule {
  name: string;
  groupName: string;
  state: string;
  arn: string;
  targetArn: string;
  creationDate: string | null;
}

export interface ScheduleDetail extends Schedule {
  scheduleExpression: string;
  timezone: string;
  flexibleTimeWindow: string;
  startDate: string | null;
  endDate: string | null;
}

function schedulerClient() {
  return new SchedulerClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listSchedules(): Promise<Schedule[]> {
  const client = schedulerClient();
  const schedules: Schedule[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListSchedulesCommand({ NextToken: nextToken }),
    );
    for (const s of out.Schedules ?? []) {
      schedules.push({
        name: s.Name ?? "",
        groupName: s.GroupName ?? "default",
        state: s.State ?? "",
        arn: s.Arn ?? "",
        targetArn: s.Target?.Arn ?? "",
        creationDate: isoOrNull(s.CreationDate),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return schedules.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSchedule(
  groupName: string,
  name: string,
): Promise<{ schedule?: ScheduleDetail; error?: string }> {
  try {
    const out = await schedulerClient().send(
      new GetScheduleCommand({ GroupName: groupName, Name: name }),
    );
    return {
      schedule: {
        name: out.Name ?? "",
        groupName: out.GroupName ?? "default",
        state: out.State ?? "",
        arn: out.Arn ?? "",
        targetArn: out.Target?.Arn ?? "",
        scheduleExpression: out.ScheduleExpression ?? "",
        timezone: out.ScheduleExpressionTimezone ?? "",
        flexibleTimeWindow: out.FlexibleTimeWindow?.Mode ?? "",
        startDate: isoOrNull(out.StartDate),
        endDate: isoOrNull(out.EndDate),
        creationDate: isoOrNull(out.CreationDate),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
