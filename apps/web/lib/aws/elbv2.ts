import {
  DescribeListenersCommand,
  DescribeLoadBalancersCommand,
  DescribeTargetGroupsCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { clientConfig } from "@/lib/aws/config";

export interface LoadBalancer {
  arn: string;
  name: string;
  dnsName: string;
  type: string;
  scheme: string;
  state: string;
  vpcId: string;
  createdTime: string | null;
}

export interface Listener {
  arn: string;
  protocol: string;
  port: number | null;
}

export interface TargetGroup {
  arn: string;
  name: string;
  protocol: string;
  port: number | null;
  targetType: string;
  healthCheckPath: string;
}

export interface LoadBalancerDetail extends LoadBalancer {
  listeners: Listener[];
  targetGroups: TargetGroup[];
}

function elbv2Client() {
  return new ElasticLoadBalancingV2Client(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listLoadBalancers(): Promise<LoadBalancer[]> {
  const client = elbv2Client();
  const loadBalancers: LoadBalancer[] = [];
  let marker: string | undefined;

  do {
    const out = await client.send(
      new DescribeLoadBalancersCommand({ Marker: marker }),
    );
    for (const lb of out.LoadBalancers ?? []) {
      loadBalancers.push({
        arn: lb.LoadBalancerArn ?? "",
        name: lb.LoadBalancerName ?? "",
        dnsName: lb.DNSName ?? "",
        type: lb.Type ?? "",
        scheme: lb.Scheme ?? "",
        state: lb.State?.Code ?? "",
        vpcId: lb.VpcId ?? "",
        createdTime: isoOrNull(lb.CreatedTime),
      });
    }
    marker = out.NextMarker;
  } while (marker);

  return loadBalancers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLoadBalancer(
  arn: string,
): Promise<{ loadBalancer?: LoadBalancerDetail; error?: string }> {
  try {
    const client = elbv2Client();
    const out = await client.send(
      new DescribeLoadBalancersCommand({ LoadBalancerArns: [arn] }),
    );
    const lb = (out.LoadBalancers ?? [])[0];
    if (!lb) return { error: "Load balancer not found" };

    const [listenersOut, targetGroupsOut] = await Promise.all([
      client.send(new DescribeListenersCommand({ LoadBalancerArn: arn })),
      client.send(new DescribeTargetGroupsCommand({ LoadBalancerArn: arn })),
    ]);

    const listeners: Listener[] = (listenersOut.Listeners ?? []).map((l) => ({
      arn: l.ListenerArn ?? "",
      protocol: l.Protocol ?? "",
      port: l.Port ?? null,
    }));

    const targetGroups: TargetGroup[] = (
      targetGroupsOut.TargetGroups ?? []
    ).map((tg) => ({
      arn: tg.TargetGroupArn ?? "",
      name: tg.TargetGroupName ?? "",
      protocol: tg.Protocol ?? "",
      port: tg.Port ?? null,
      targetType: tg.TargetType ?? "",
      healthCheckPath: tg.HealthCheckPath ?? "",
    }));

    return {
      loadBalancer: {
        arn: lb.LoadBalancerArn ?? arn,
        name: lb.LoadBalancerName ?? "",
        dnsName: lb.DNSName ?? "",
        type: lb.Type ?? "",
        scheme: lb.Scheme ?? "",
        state: lb.State?.Code ?? "",
        vpcId: lb.VpcId ?? "",
        createdTime: isoOrNull(lb.CreatedTime),
        listeners,
        targetGroups,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
