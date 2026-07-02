import {
  DescribeDeliveryStreamCommand,
  FirehoseClient,
  ListDeliveryStreamsCommand,
} from "@aws-sdk/client-firehose";
import { clientConfig } from "@/lib/aws/config";

export interface DeliveryStream {
  name: string;
  arn: string;
  status: string;
  type: string;
  createdAt: string | null;
}

export interface Destination {
  id: string;
  type: string;
  target: string;
}

export interface DeliveryStreamDetail extends DeliveryStream {
  destinations: Destination[];
}

function firehoseClient() {
  return new FirehoseClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listDeliveryStreams(): Promise<DeliveryStream[]> {
  const client = firehoseClient();
  const names: string[] = [];
  let exclusiveStartName: string | undefined;

  do {
    const out = await client.send(
      new ListDeliveryStreamsCommand({
        ExclusiveStartDeliveryStreamName: exclusiveStartName,
      }),
    );
    const pageNames = out.DeliveryStreamNames ?? [];
    names.push(...pageNames);
    exclusiveStartName = out.HasMoreDeliveryStreams
      ? pageNames[pageNames.length - 1]
      : undefined;
  } while (exclusiveStartName);

  const streams = await Promise.all(
    names.map(async (name) => {
      const out = await client.send(
        new DescribeDeliveryStreamCommand({ DeliveryStreamName: name }),
      );
      const d = out.DeliveryStreamDescription;
      return {
        name,
        arn: d?.DeliveryStreamARN ?? "",
        status: d?.DeliveryStreamStatus ?? "",
        type: d?.DeliveryStreamType ?? "",
        createdAt: isoOrNull(d?.CreateTimestamp),
      };
    }),
  );

  return streams.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDeliveryStream(
  name: string,
): Promise<{ stream?: DeliveryStreamDetail; error?: string }> {
  try {
    const out = await firehoseClient().send(
      new DescribeDeliveryStreamCommand({ DeliveryStreamName: name }),
    );
    const d = out.DeliveryStreamDescription;
    if (!d) return { error: "Delivery stream not found" };

    const destinations: Destination[] = (d.Destinations ?? []).map((dest) => {
      let type = "";
      let target = "";
      if (dest.ExtendedS3DestinationDescription) {
        type = "Extended S3";
        target = dest.ExtendedS3DestinationDescription.BucketARN ?? "";
      } else if (dest.S3DestinationDescription) {
        type = "S3";
        target = dest.S3DestinationDescription.BucketARN ?? "";
      } else if (dest.RedshiftDestinationDescription) {
        type = "Redshift";
        target =
          dest.RedshiftDestinationDescription.ClusterJDBCURL ?? "";
      } else if (dest.ElasticsearchDestinationDescription) {
        type = "Elasticsearch";
        target =
          dest.ElasticsearchDestinationDescription.DomainARN ?? "";
      } else if (dest.HttpEndpointDestinationDescription) {
        type = "HTTP Endpoint";
        target =
          dest.HttpEndpointDestinationDescription.EndpointConfiguration?.Url ??
          "";
      } else if (dest.SplunkDestinationDescription) {
        type = "Splunk";
        target = dest.SplunkDestinationDescription.HECEndpoint ?? "";
      }
      return {
        id: dest.DestinationId ?? "",
        type,
        target,
      };
    });

    return {
      stream: {
        name: d.DeliveryStreamName ?? name,
        arn: d.DeliveryStreamARN ?? "",
        status: d.DeliveryStreamStatus ?? "",
        type: d.DeliveryStreamType ?? "",
        createdAt: isoOrNull(d.CreateTimestamp),
        destinations,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
