import {
  DescribeRouteTablesCommand,
  DescribeSecurityGroupsCommand,
  DescribeSubnetsCommand,
  DescribeVpcsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import type { Tag } from "@aws-sdk/client-ec2";
import { clientConfig } from "@/lib/aws/config";

export interface Vpc {
  id: string;
  name: string;
  cidrBlock: string;
  state: string;
  isDefault: boolean;
  tags: { key: string; value: string }[];
}

export interface Subnet {
  id: string;
  name: string;
  cidrBlock: string;
  availabilityZone: string;
  state: string;
  availableIps: number;
  mapPublicIpOnLaunch: boolean;
}

export interface SecurityGroupSummary {
  id: string;
  name: string;
  description: string;
}

export interface RouteTableSummary {
  id: string;
  name: string;
  routeCount: number;
  associationCount: number;
}

export interface VpcDetail extends Vpc {
  subnets: Subnet[];
  securityGroups: SecurityGroupSummary[];
  routeTables: RouteTableSummary[];
}

function ec2Client() {
  return new EC2Client(clientConfig());
}

function nameFromTags(tags: Tag[] | undefined): string {
  return (tags ?? []).find((t) => t.Key === "Name")?.Value ?? "";
}

export async function listVpcs(): Promise<Vpc[]> {
  const out = await ec2Client().send(new DescribeVpcsCommand({}));
  return (out.Vpcs ?? [])
    .map((v) => ({
      id: v.VpcId ?? "",
      name: nameFromTags(v.Tags),
      cidrBlock: v.CidrBlock ?? "",
      state: v.State ?? "",
      isDefault: Boolean(v.IsDefault),
      tags: (v.Tags ?? []).map((t) => ({
        key: t.Key ?? "",
        value: t.Value ?? "",
      })),
    }))
    .sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return (a.name || a.id).localeCompare(b.name || b.id);
    });
}

export async function getVpc(
  id: string,
): Promise<{ vpc?: VpcDetail; error?: string }> {
  try {
    const client = ec2Client();
    const vpcsOut = await client.send(
      new DescribeVpcsCommand({ VpcIds: [id] }),
    );
    const v = vpcsOut.Vpcs?.[0];
    if (!v) return { error: "VPC not found" };

    const filters = [{ Name: "vpc-id", Values: [id] }];
    const [subnetsOut, sgOut, rtOut] = await Promise.all([
      client.send(new DescribeSubnetsCommand({ Filters: filters })),
      client.send(new DescribeSecurityGroupsCommand({ Filters: filters })),
      client.send(new DescribeRouteTablesCommand({ Filters: filters })),
    ]);

    const subnets: Subnet[] = (subnetsOut.Subnets ?? []).map((s) => ({
      id: s.SubnetId ?? "",
      name: nameFromTags(s.Tags),
      cidrBlock: s.CidrBlock ?? "",
      availabilityZone: s.AvailabilityZone ?? "",
      state: s.State ?? "",
      availableIps: s.AvailableIpAddressCount ?? 0,
      mapPublicIpOnLaunch: Boolean(s.MapPublicIpOnLaunch),
    }));

    const securityGroups: SecurityGroupSummary[] = (
      sgOut.SecurityGroups ?? []
    ).map((g) => ({
      id: g.GroupId ?? "",
      name: g.GroupName ?? "",
      description: g.Description ?? "",
    }));

    const routeTables: RouteTableSummary[] = (rtOut.RouteTables ?? []).map(
      (r) => ({
        id: r.RouteTableId ?? "",
        name: nameFromTags(r.Tags),
        routeCount: r.Routes?.length ?? 0,
        associationCount: r.Associations?.length ?? 0,
      }),
    );

    return {
      vpc: {
        id: v.VpcId ?? id,
        name: nameFromTags(v.Tags),
        cidrBlock: v.CidrBlock ?? "",
        state: v.State ?? "",
        isDefault: Boolean(v.IsDefault),
        tags: (v.Tags ?? []).map((t) => ({
          key: t.Key ?? "",
          value: t.Value ?? "",
        })),
        subnets,
        securityGroups,
        routeTables,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
