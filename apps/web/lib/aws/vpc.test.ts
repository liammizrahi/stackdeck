import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DescribeVpcsCommand, EC2Client } from "@aws-sdk/client-ec2";
import { listVpcs } from "@/lib/aws/vpc";

const ec2 = mockClient(EC2Client);

afterEach(() => ec2.reset());

describe("listVpcs", () => {
  it("maps id/cidr, extracts Name from tags, and puts the default VPC first", async () => {
    ec2.on(DescribeVpcsCommand).resolves({
      Vpcs: [
        {
          VpcId: "vpc-2222",
          CidrBlock: "10.1.0.0/16",
          State: "available",
          IsDefault: false,
          Tags: [{ Key: "Name", Value: "app-vpc" }],
        },
        {
          VpcId: "vpc-1111",
          CidrBlock: "172.31.0.0/16",
          State: "available",
          IsDefault: true,
          Tags: [{ Key: "Name", Value: "default-vpc" }],
        },
      ],
    });
    const result = await listVpcs();
    expect(result.map((v) => v.id)).toEqual(["vpc-1111", "vpc-2222"]);
    expect(result[0]?.isDefault).toBe(true);
    expect(result[0]?.name).toBe("default-vpc");
    expect(result[1]?.cidrBlock).toBe("10.1.0.0/16");
    expect(result[1]?.name).toBe("app-vpc");
  });

  it("returns empty array when no vpcs exist", async () => {
    ec2.on(DescribeVpcsCommand).resolves({ Vpcs: [] });
    const result = await listVpcs();
    expect(result).toEqual([]);
  });
});
