import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListHostedZonesCommand,
  Route53Client,
} from "@aws-sdk/client-route-53";
import { listHostedZones } from "@/lib/aws/route53";

const route53 = mockClient(Route53Client);

afterEach(() => route53.reset());

describe("listHostedZones", () => {
  it("strips the /hostedzone/ prefix, maps recordCount, and sorts by name", async () => {
    route53.on(ListHostedZonesCommand).resolves({
      HostedZones: [
        {
          Id: "/hostedzone/Z00000ZETA",
          Name: "zeta.example.com.",
          CallerReference: "zeta-ref",
          ResourceRecordSetCount: 5,
          Config: { PrivateZone: false, Comment: "zeta zone" },
        },
        {
          Id: "/hostedzone/Z00000ALPHA",
          Name: "alpha.example.com.",
          CallerReference: "alpha-ref",
          ResourceRecordSetCount: 2,
          Config: { PrivateZone: true, Comment: "alpha zone" },
        },
      ],
    });
    const result = await listHostedZones();
    expect(result.map((z) => z.name)).toEqual([
      "alpha.example.com.",
      "zeta.example.com.",
    ]);
    expect(result[0]?.id).toBe("Z00000ALPHA");
    expect(result[0]?.recordCount).toBe(2);
    expect(result[0]?.privateZone).toBe(true);
    expect(result[1]?.id).toBe("Z00000ZETA");
  });

  it("returns empty array when no hosted zones exist", async () => {
    route53.on(ListHostedZonesCommand).resolves({ HostedZones: [] });
    const result = await listHostedZones();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    route53
      .on(ListHostedZonesCommand, { Marker: undefined })
      .resolves({
        HostedZones: [
          {
            Id: "/hostedzone/Z2BETA",
            Name: "beta.example.com.",
            CallerReference: "beta-ref",
          },
        ],
        IsTruncated: true,
        NextMarker: "page2marker",
      })
      .on(ListHostedZonesCommand, { Marker: "page2marker" })
      .resolves({
        HostedZones: [
          {
            Id: "/hostedzone/Z1ALPHA",
            Name: "alpha.example.com.",
            CallerReference: "alpha-ref",
          },
        ],
      });
    const result = await listHostedZones();
    expect(result.map((z) => z.name)).toEqual([
      "alpha.example.com.",
      "beta.example.com.",
    ]);
  });
});
