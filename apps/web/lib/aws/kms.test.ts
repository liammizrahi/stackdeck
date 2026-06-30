import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeKeyCommand,
  KMSClient,
  ListAliasesCommand,
  ListKeysCommand,
} from "@aws-sdk/client-kms";
import { listKeys } from "@/lib/aws/kms";

const kms = mockClient(KMSClient);

afterEach(() => kms.reset());

describe("listKeys", () => {
  it("maps state/usage, attaches aliases, and sorts by keyId", async () => {
    kms.on(ListKeysCommand).resolves({
      Keys: [{ KeyId: "key-zeta" }, { KeyId: "key-alpha" }],
    });
    kms.on(ListAliasesCommand).resolves({
      Aliases: [
        { AliasName: "alias/my-app", TargetKeyId: "key-alpha" },
        { AliasName: "alias/secondary", TargetKeyId: "key-alpha" },
      ],
    });
    kms.on(DescribeKeyCommand, { KeyId: "key-alpha" }).resolves({
      KeyMetadata: {
        KeyId: "key-alpha",
        Arn: "arn:aws:kms:us-east-1:123456789012:key/key-alpha",
        KeyState: "Enabled",
        KeyUsage: "ENCRYPT_DECRYPT",
        Description: "alpha key",
      },
    });
    kms.on(DescribeKeyCommand, { KeyId: "key-zeta" }).resolves({
      KeyMetadata: {
        KeyId: "key-zeta",
        Arn: "arn:aws:kms:us-east-1:123456789012:key/key-zeta",
        KeyState: "Disabled",
        KeyUsage: "SIGN_VERIFY",
        Description: "zeta key",
      },
    });

    const result = await listKeys();

    expect(result.map((k) => k.keyId)).toEqual(["key-alpha", "key-zeta"]);
    expect(result[0]?.state).toBe("Enabled");
    expect(result[0]?.keyUsage).toBe("ENCRYPT_DECRYPT");
    expect(result[0]?.aliases).toEqual(["my-app", "secondary"]);
    expect(result[1]?.state).toBe("Disabled");
    expect(result[1]?.keyUsage).toBe("SIGN_VERIFY");
    expect(result[1]?.aliases).toEqual([]);
  });

  it("returns empty array when no keys exist", async () => {
    kms.on(ListKeysCommand).resolves({ Keys: [] });
    kms.on(ListAliasesCommand).resolves({ Aliases: [] });
    const result = await listKeys();
    expect(result).toEqual([]);
  });

  it("paginates through multiple key pages", async () => {
    kms
      .on(ListKeysCommand, { Marker: undefined })
      .resolves({ Keys: [{ KeyId: "key-beta" }], Truncated: true, NextMarker: "m2" })
      .on(ListKeysCommand, { Marker: "m2" })
      .resolves({ Keys: [{ KeyId: "key-alpha" }] });
    kms.on(ListAliasesCommand).resolves({ Aliases: [] });
    kms.on(DescribeKeyCommand, { KeyId: "key-alpha" }).resolves({
      KeyMetadata: { KeyId: "key-alpha", KeyState: "Enabled", KeyUsage: "ENCRYPT_DECRYPT" },
    });
    kms.on(DescribeKeyCommand, { KeyId: "key-beta" }).resolves({
      KeyMetadata: { KeyId: "key-beta", KeyState: "Enabled", KeyUsage: "ENCRYPT_DECRYPT" },
    });

    const result = await listKeys();
    expect(result.map((k) => k.keyId)).toEqual(["key-alpha", "key-beta"]);
  });
});
