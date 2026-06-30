import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { ListStateMachinesCommand, SFNClient } from "@aws-sdk/client-sfn";
import { listStateMachines } from "@/lib/aws/stepfunctions";

const sfn = mockClient(SFNClient);

afterEach(() => sfn.reset());

describe("listStateMachines", () => {
  it("maps arn and name, and sorts by name", async () => {
    sfn.on(ListStateMachinesCommand).resolves({
      stateMachines: [
        {
          stateMachineArn: "arn:aws:states:us-east-1:123456789012:stateMachine:zeta",
          name: "zeta",
          type: "STANDARD",
          creationDate: new Date(),
        },
        {
          stateMachineArn: "arn:aws:states:us-east-1:123456789012:stateMachine:alpha",
          name: "alpha",
          type: "EXPRESS",
          creationDate: new Date(),
        },
      ],
    });
    const result = await listStateMachines();
    expect(result.map((m) => m.name)).toEqual(["alpha", "zeta"]);
    expect(result[0]?.arn).toBe(
      "arn:aws:states:us-east-1:123456789012:stateMachine:alpha",
    );
    expect(result[0]?.name).toBe("alpha");
  });

  it("returns empty array when no state machines exist", async () => {
    sfn.on(ListStateMachinesCommand).resolves({ stateMachines: [] });
    const result = await listStateMachines();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    sfn
      .on(ListStateMachinesCommand, { nextToken: undefined })
      .resolves({
        stateMachines: [
          {
            stateMachineArn: "arn:aws:states:us-east-1:123:stateMachine:beta",
            name: "beta",
            type: "STANDARD",
            creationDate: new Date(),
          },
        ],
        nextToken: "page2token",
      })
      .on(ListStateMachinesCommand, { nextToken: "page2token" })
      .resolves({
        stateMachines: [
          {
            stateMachineArn: "arn:aws:states:us-east-1:123:stateMachine:alpha",
            name: "alpha",
            type: "STANDARD",
            creationDate: new Date(),
          },
        ],
      });
    const result = await listStateMachines();
    expect(result.map((m) => m.name)).toEqual(["alpha", "beta"]);
  });
});
