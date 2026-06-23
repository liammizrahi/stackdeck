import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ApiGatewayV2Client,
  GetApisCommand,
  GetRoutesCommand,
} from "@aws-sdk/client-apigatewayv2";
import { listApis, getRoutes } from "@/lib/aws/apigateway";

const apigw = mockClient(ApiGatewayV2Client);

afterEach(() => apigw.reset());

describe("listApis", () => {
  it("maps and sorts APIs by name", async () => {
    apigw.on(GetApisCommand).resolves({
      Items: [
        {
          ApiId: "abc123",
          Name: "zeta-api",
          ProtocolType: "HTTP",
          ApiEndpoint: "https://abc123.execute-api.us-east-1.amazonaws.com",
          RouteSelectionExpression: "$request.method $request.path",
        },
        {
          ApiId: "xyz789",
          Name: "alpha-api",
          ProtocolType: "WEBSOCKET",
          ApiEndpoint: "wss://xyz789.execute-api.us-east-1.amazonaws.com",
          RouteSelectionExpression: "$request.body.action",
        },
      ],
    });
    const result = await listApis();
    expect(result.map((a) => a.name)).toEqual(["alpha-api", "zeta-api"]);
    expect(result[0]?.id).toBe("xyz789");
    expect(result[0]?.protocolType).toBe("WEBSOCKET");
    expect(result[1]?.endpoint).toBe(
      "https://abc123.execute-api.us-east-1.amazonaws.com",
    );
  });

  it("returns empty array when no APIs exist", async () => {
    apigw.on(GetApisCommand).resolves({ Items: [] });
    const result = await listApis();
    expect(result).toEqual([]);
  });
});

describe("getRoutes", () => {
  it("maps routes from Items", async () => {
    apigw.on(GetRoutesCommand).resolves({
      Items: [
        {
          RouteKey: "GET /users",
          Target: "integrations/abc",
          AuthorizationType: "JWT",
        },
        {
          RouteKey: "POST /users",
          Target: "integrations/def",
          AuthorizationType: "NONE",
        },
      ],
    });
    const result = await getRoutes("abc123");
    expect(result.routes).toHaveLength(2);
    expect(result.routes?.[0]?.routeKey).toBe("GET /users");
    expect(result.routes?.[0]?.target).toBe("integrations/abc");
    expect(result.routes?.[0]?.authorizationType).toBe("JWT");
  });

  it("returns error on failure", async () => {
    apigw.on(GetRoutesCommand).rejects(new Error("Access denied"));
    const result = await getRoutes("bad-id");
    expect(result.error).toBe("Access denied");
    expect(result.routes).toBeUndefined();
  });
});
