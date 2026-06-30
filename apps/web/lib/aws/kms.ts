import {
  DescribeKeyCommand,
  KMSClient,
  ListAliasesCommand,
  ListKeysCommand,
} from "@aws-sdk/client-kms";
import { clientConfig } from "@/lib/aws/config";

export interface KmsKey {
  keyId: string;
  arn: string;
  aliases: string[];
  state: string;
  keyUsage: string;
  description: string;
  creationDate: string | null;
}

export interface KmsKeyDetail extends KmsKey {
  enabled: boolean;
  keyManager: string;
  keySpec: string;
  origin: string;
  multiRegion: boolean;
}

function kmsClient() {
  return new KMSClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

function stripAliasPrefix(name: string): string {
  return name.startsWith("alias/") ? name.slice("alias/".length) : name;
}

async function aliasMap(client: KMSClient): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  let marker: string | undefined;

  do {
    const out = await client.send(new ListAliasesCommand({ Marker: marker }));
    for (const alias of out.Aliases ?? []) {
      const target = alias.TargetKeyId;
      const name = alias.AliasName;
      if (!target || !name) continue;
      const existing = map.get(target) ?? [];
      existing.push(stripAliasPrefix(name));
      map.set(target, existing);
    }
    marker = out.Truncated ? out.NextMarker : undefined;
  } while (marker);

  return map;
}

export async function listKeys(): Promise<KmsKey[]> {
  const client = kmsClient();
  const keyIds: string[] = [];
  let marker: string | undefined;

  do {
    const out = await client.send(new ListKeysCommand({ Marker: marker }));
    for (const k of out.Keys ?? []) {
      if (k.KeyId) keyIds.push(k.KeyId);
    }
    marker = out.Truncated ? out.NextMarker : undefined;
  } while (marker);

  const aliases = await aliasMap(client);

  const keys = await Promise.all(
    keyIds.map(async (keyId) => {
      const out = await client.send(
        new DescribeKeyCommand({ KeyId: keyId }),
      );
      const meta = out.KeyMetadata;
      return {
        keyId,
        arn: meta?.Arn ?? "",
        aliases: aliases.get(keyId) ?? [],
        state: meta?.KeyState ?? "",
        keyUsage: meta?.KeyUsage ?? "",
        description: meta?.Description ?? "",
        creationDate: isoOrNull(meta?.CreationDate),
      };
    }),
  );

  return keys.sort((a, b) => a.keyId.localeCompare(b.keyId));
}

export async function getKey(
  id: string,
): Promise<{ key?: KmsKeyDetail; error?: string }> {
  try {
    const client = kmsClient();
    const out = await client.send(new DescribeKeyCommand({ KeyId: id }));
    const meta = out.KeyMetadata;
    if (!meta) return { error: "Key not found" };

    const aliases: string[] = [];
    let marker: string | undefined;
    do {
      const aliasOut = await client.send(
        new ListAliasesCommand({ KeyId: id, Marker: marker }),
      );
      for (const alias of aliasOut.Aliases ?? []) {
        if (alias.AliasName) aliases.push(stripAliasPrefix(alias.AliasName));
      }
      marker = aliasOut.Truncated ? aliasOut.NextMarker : undefined;
    } while (marker);

    return {
      key: {
        keyId: meta.KeyId ?? id,
        arn: meta.Arn ?? "",
        aliases,
        state: meta.KeyState ?? "",
        keyUsage: meta.KeyUsage ?? "",
        description: meta.Description ?? "",
        creationDate: isoOrNull(meta.CreationDate),
        enabled: Boolean(meta.Enabled),
        keyManager: meta.KeyManager ?? "",
        keySpec: meta.KeySpec ?? "",
        origin: meta.Origin ?? "",
        multiRegion: Boolean(meta.MultiRegion),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
