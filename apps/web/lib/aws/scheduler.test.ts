import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListSchedulesCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import { listSchedules } from "@/lib/aws/scheduler";

const scheduler = mockClient(SchedulerClient);

afterEach(() => scheduler.reset());

describe("listSchedules", () => {
  it("maps name/state/targetArn and sorts by name", async () => {
    scheduler.on(ListSchedulesCommand).resolves({
      Schedules: [
        {
          Name: "zeta-schedule",
          GroupName: "default",
          State: "ENABLED",
          Arn: "arn:aws:scheduler:us-east-1:123456789012:schedule/default/zeta-schedule",
          Target: { Arn: "arn:aws:lambda:us-east-1:123456789012:function:zeta" },
        },
        {
          Name: "alpha-schedule",
          GroupName: "default",
          State: "DISABLED",
          Arn: "arn:aws:scheduler:us-east-1:123456789012:schedule/default/alpha-schedule",
          Target: { Arn: "arn:aws:lambda:us-east-1:123456789012:function:alpha" },
        },
      ],
    });
    const result = await listSchedules();
    expect(result.map((s) => s.name)).toEqual([
      "alpha-schedule",
      "zeta-schedule",
    ]);
    expect(result[0]?.state).toBe("DISABLED");
    expect(result[0]?.targetArn).toBe(
      "arn:aws:lambda:us-east-1:123456789012:function:alpha",
    );
  });

  it("returns empty array when no schedules exist", async () => {
    scheduler.on(ListSchedulesCommand).resolves({ Schedules: [] });
    const result = await listSchedules();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    scheduler
      .on(ListSchedulesCommand, { NextToken: undefined })
      .resolves({
        Schedules: [{ Name: "beta-schedule", GroupName: "default" }],
        NextToken: "page2token",
      })
      .on(ListSchedulesCommand, { NextToken: "page2token" })
      .resolves({
        Schedules: [{ Name: "alpha-schedule", GroupName: "default" }],
      });
    const result = await listSchedules();
    expect(result.map((s) => s.name)).toEqual([
      "alpha-schedule",
      "beta-schedule",
    ]);
  });
});
