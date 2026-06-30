import {
  GetHostedZoneCommand,
  ListHostedZonesCommand,
  ListResourceRecordSetsCommand,
  Route53Client,
  type RRType,
} from "@aws-sdk/client-route-53";
import { clientConfig } from "@/lib/aws/config";

export interface HostedZone {
  id: string;
  name: string;
  recordCount: number;
  privateZone: boolean;
  comment: string;
}

export interface RecordSet {
  name: string;
  type: string;
  ttl: number | null;
  values: string[];
}

export interface HostedZoneDetail {
  zone: HostedZone;
  records: RecordSet[];
}

function route53Client() {
  return new Route53Client(clientConfig());
}

function stripZonePrefix(id: string): string {
  return id.replace(/^\/hostedzone\//, "");
}

export async function listHostedZones(): Promise<HostedZone[]> {
  const client = route53Client();
  const zones: HostedZone[] = [];
  let marker: string | undefined;

  do {
    const out = await client.send(
      new ListHostedZonesCommand({ Marker: marker }),
    );
    for (const z of out.HostedZones ?? []) {
      zones.push({
        id: stripZonePrefix(z.Id ?? ""),
        name: z.Name ?? "",
        recordCount: z.ResourceRecordSetCount ?? 0,
        privateZone: Boolean(z.Config?.PrivateZone),
        comment: z.Config?.Comment ?? "",
      });
    }
    marker = out.IsTruncated ? out.NextMarker : undefined;
  } while (marker);

  return zones.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getHostedZone(
  id: string,
): Promise<{ detail?: HostedZoneDetail; error?: string }> {
  try {
    const client = route53Client();

    const zoneOut = await client.send(new GetHostedZoneCommand({ Id: id }));
    const z = zoneOut.HostedZone;
    if (!z) return { error: "Hosted zone not found" };

    const zone: HostedZone = {
      id: stripZonePrefix(z.Id ?? id),
      name: z.Name ?? "",
      recordCount: z.ResourceRecordSetCount ?? 0,
      privateZone: Boolean(z.Config?.PrivateZone),
      comment: z.Config?.Comment ?? "",
    };

    const records: RecordSet[] = [];
    let startName: string | undefined;
    let startType: RRType | undefined;

    do {
      const out = await client.send(
        new ListResourceRecordSetsCommand({
          HostedZoneId: id,
          StartRecordName: startName,
          StartRecordType: startType,
        }),
      );
      for (const r of out.ResourceRecordSets ?? []) {
        const values = r.AliasTarget
          ? [`ALIAS ${r.AliasTarget.DNSName ?? ""}`]
          : (r.ResourceRecords ?? []).map((rr) => rr.Value ?? "");
        records.push({
          name: r.Name ?? "",
          type: r.Type ?? "",
          ttl: r.TTL ?? null,
          values,
        });
      }
      if (out.IsTruncated) {
        startName = out.NextRecordName;
        startType = out.NextRecordType;
      } else {
        startName = undefined;
        startType = undefined;
      }
    } while (startName);

    return { detail: { zone, records } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
