import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";
import { clientConfig } from "@/lib/aws/config";

export interface SecurityGroupRef {
  id: string;
  name: string;
}

export interface Ec2Instance {
  id: string;
  name: string;
  type: string;
  state: string;
  privateIp: string;
  publicIp: string;
  imageId: string;
  availabilityZone: string;
  vpcId: string;
  subnetId: string;
  launchTime: string | null;
  securityGroups: SecurityGroupRef[];
  tags: { key: string; value: string }[];
}

function ec2Client() {
  return new EC2Client(clientConfig());
}

function isoDate(d: Date | undefined): string | null {
  return d ? d.toISOString() : null;
}

export async function listInstances(): Promise<Ec2Instance[]> {
  const out = await ec2Client().send(new DescribeInstancesCommand({}));
  const instances = (out.Reservations ?? []).flatMap((r) =>
    (r.Instances ?? []).map((i) => {
      const tags = (i.Tags ?? []).map((t) => ({
        key: t.Key ?? "",
        value: t.Value ?? "",
      }));
      const name = tags.find((t) => t.key === "Name")?.value ?? "";
      return {
        id: i.InstanceId ?? "",
        name,
        type: i.InstanceType ?? "",
        state: i.State?.Name ?? "",
        privateIp: i.PrivateIpAddress ?? "",
        publicIp: i.PublicIpAddress ?? "",
        imageId: i.ImageId ?? "",
        availabilityZone: i.Placement?.AvailabilityZone ?? "",
        vpcId: i.VpcId ?? "",
        subnetId: i.SubnetId ?? "",
        launchTime: isoDate(i.LaunchTime),
        securityGroups: (i.SecurityGroups ?? []).map((g) => ({
          id: g.GroupId ?? "",
          name: g.GroupName ?? "",
        })),
        tags,
      };
    }),
  );
  return instances.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getInstance(id: string): Promise<Ec2Instance | null> {
  const instances = await listInstances();
  return instances.find((i) => i.id === id) ?? null;
}
