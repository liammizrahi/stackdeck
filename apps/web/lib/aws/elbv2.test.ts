import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { listLoadBalancers } from "@/lib/aws/elbv2";

const elbv2 = mockClient(ElasticLoadBalancingV2Client);

afterEach(() => elbv2.reset());

describe("listLoadBalancers", () => {
  it("maps load balancers and sorts by name", async () => {
    elbv2.on(DescribeLoadBalancersCommand).resolves({
      LoadBalancers: [
        {
          LoadBalancerArn: "arn:aws:elbv2:us-east-1:123:loadbalancer/app/zeta/1",
          LoadBalancerName: "zeta",
          DNSName: "zeta.elb.amazonaws.com",
          Type: "application",
          Scheme: "internet-facing",
          State: { Code: "active" },
          VpcId: "vpc-1",
        },
        {
          LoadBalancerArn: "arn:aws:elbv2:us-east-1:123:loadbalancer/app/alpha/2",
          LoadBalancerName: "alpha",
          DNSName: "alpha.elb.amazonaws.com",
          Type: "network",
          Scheme: "internal",
          State: { Code: "provisioning" },
          VpcId: "vpc-2",
        },
      ],
    });
    const result = await listLoadBalancers();
    expect(result.map((lb) => lb.name)).toEqual(["alpha", "zeta"]);
    expect(result[0]?.dnsName).toBe("alpha.elb.amazonaws.com");
    expect(result[0]?.state).toBe("provisioning");
    expect(result[1]?.state).toBe("active");
  });

  it("returns empty array when no load balancers exist", async () => {
    elbv2.on(DescribeLoadBalancersCommand).resolves({ LoadBalancers: [] });
    const result = await listLoadBalancers();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    elbv2
      .on(DescribeLoadBalancersCommand, { Marker: undefined })
      .resolves({
        LoadBalancers: [
          {
            LoadBalancerArn: "arn:aws:elbv2:us-east-1:123:loadbalancer/app/beta/1",
            LoadBalancerName: "beta",
            DNSName: "beta.elb.amazonaws.com",
            State: { Code: "active" },
          },
        ],
        NextMarker: "page2",
      })
      .on(DescribeLoadBalancersCommand, { Marker: "page2" })
      .resolves({
        LoadBalancers: [
          {
            LoadBalancerArn: "arn:aws:elbv2:us-east-1:123:loadbalancer/app/alpha/2",
            LoadBalancerName: "alpha",
            DNSName: "alpha.elb.amazonaws.com",
            State: { Code: "active" },
          },
        ],
      });
    const result = await listLoadBalancers();
    expect(result.map((lb) => lb.name)).toEqual(["alpha", "beta"]);
  });
});
