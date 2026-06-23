"use server";

import {
  type LogEvent,
  getStreamEvents,
  searchAllGroups,
  searchGroup,
} from "@/lib/aws/cloudwatch";

export async function searchGroupAction(
  group: string,
  pattern: string,
  startTime?: number,
): Promise<LogEvent[]> {
  return searchGroup(group, pattern, startTime);
}

export async function searchAllGroupsAction(
  pattern: string,
  startTime?: number,
): Promise<LogEvent[]> {
  return searchAllGroups(pattern, startTime);
}

export async function streamEventsAction(
  group: string,
  stream: string,
  startTime?: number,
): Promise<LogEvent[]> {
  return getStreamEvents(group, stream, startTime);
}
