import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  LambdaClient,
  ListFunctionsCommand,
  ListTagsCommand,
} from "@aws-sdk/client-lambda";
import { listFunctions } from "@/lib/aws/lambda";

const lambda = mockClient(LambdaClient);

afterEach(() => lambda.reset());

describe("listFunctions", () => {
  it("maps and sorts functions by name", async () => {
    lambda.on(ListTagsCommand).resolves({ Tags: {} });
    lambda.on(ListFunctionsCommand).resolves({
      Functions: [
        {
          FunctionName: "zebra-fn",
          FunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:zebra-fn",
          Runtime: "nodejs20.x",
          MemorySize: 256,
          Timeout: 30,
          LastModified: "2024-01-15T10:00:00.000+0000",
          Description: "Z function",
        },
        {
          FunctionName: "alpha-fn",
          FunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:alpha-fn",
          Runtime: "python3.12",
          MemorySize: 128,
          Timeout: 15,
          LastModified: "2024-02-20T12:00:00.000+0000",
          Description: "A function",
        },
      ],
    });

    const result = await listFunctions();
    expect(result.map((f) => f.name)).toEqual(["alpha-fn", "zebra-fn"]);
    expect(result[0]?.runtime).toBe("python3.12");
    expect(result[0]?.memory).toBe(128);
    expect(result[0]?.timeout).toBe(15);
    expect(result[0]?.description).toBe("A function");
    expect(result[0]?.arn).toBe("arn:aws:lambda:us-east-1:123456789012:function:alpha-fn");
    expect(result[0]?.tags).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    lambda.on(ListTagsCommand).resolves({ Tags: {} });
    lambda
      .on(ListFunctionsCommand, { Marker: undefined })
      .resolves({
        Functions: [{ FunctionName: "fn-b", FunctionArn: "arn:aws:lambda:::function:fn-b", Runtime: "nodejs20.x", MemorySize: 128, Timeout: 3, LastModified: "", Description: "" }],
        NextMarker: "page2",
      })
      .on(ListFunctionsCommand, { Marker: "page2" })
      .resolves({
        Functions: [{ FunctionName: "fn-a", FunctionArn: "arn:aws:lambda:::function:fn-a", Runtime: "python3.12", MemorySize: 256, Timeout: 10, LastModified: "", Description: "" }],
      });

    const result = await listFunctions();
    expect(result.map((f) => f.name)).toEqual(["fn-a", "fn-b"]);
  });

  it("returns empty array when no functions exist", async () => {
    lambda.on(ListFunctionsCommand).resolves({ Functions: [] });
    const result = await listFunctions();
    expect(result).toEqual([]);
  });

  it("handles missing optional fields with defaults", async () => {
    lambda.on(ListTagsCommand).resolves({ Tags: {} });
    lambda.on(ListFunctionsCommand).resolves({
      Functions: [{ FunctionName: "bare-fn" }],
    });
    const result = await listFunctions();
    expect(result[0]).toEqual({
      name: "bare-fn",
      arn: "",
      runtime: "",
      memory: 0,
      timeout: 0,
      lastModified: "",
      description: "",
      tags: [],
    });
  });

  it("fetches and maps tags for each function", async () => {
    lambda.on(ListFunctionsCommand).resolves({
      Functions: [
        {
          FunctionName: "tagged-fn",
          FunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:tagged-fn",
          Runtime: "nodejs20.x",
          MemorySize: 128,
          Timeout: 3,
          LastModified: "",
          Description: "",
        },
      ],
    });
    lambda.on(ListTagsCommand, { Resource: "arn:aws:lambda:us-east-1:123456789012:function:tagged-fn" }).resolves({
      Tags: { env: "prod", team: "platform" },
    });

    const result = await listFunctions();
    expect(result[0]?.tags).toEqual(
      expect.arrayContaining([
        { key: "env", value: "prod" },
        { key: "team", value: "platform" },
      ]),
    );
  });

  it("returns empty tags when ListTagsCommand fails", async () => {
    lambda.on(ListFunctionsCommand).resolves({
      Functions: [
        {
          FunctionName: "error-fn",
          FunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:error-fn",
          Runtime: "nodejs20.x",
          MemorySize: 128,
          Timeout: 3,
          LastModified: "",
          Description: "",
        },
      ],
    });
    lambda.on(ListTagsCommand).rejects(new Error("AccessDenied"));

    const result = await listFunctions();
    expect(result[0]?.tags).toEqual([]);
  });
});
