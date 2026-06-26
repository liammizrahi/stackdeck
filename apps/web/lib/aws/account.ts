import {
  AccountClient,
  GetContactInformationCommand,
  ListRegionsCommand,
} from "@aws-sdk/client-account";
import { Sha256 } from "@aws-crypto/sha256-js";
import { SignatureV4 } from "@smithy/signature-v4";
import type { HttpRequest } from "@smithy/types";
import { clientConfig, getAwsSettings } from "@/lib/aws/config";

export interface AccountInformation {
  accountId: string;
  accountName: string;
  accountState: string;
  createdDate: string | null;
}

export interface ContactInformation {
  fullName: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  websiteUrl: string;
}

export interface RegionStatus {
  name: string;
  status: string;
}

function accountClient() {
  return new AccountClient(clientConfig());
}

async function accountApi(action: string): Promise<Record<string, unknown>> {
  const { endpoint, region, accessKeyId, secretAccessKey } = getAwsSettings();
  const url = new URL(`${endpoint.replace(/\/+$/, "")}/${action}`);
  const signer = new SignatureV4({
    service: "account",
    region,
    credentials: { accessKeyId, secretAccessKey },
    sha256: Sha256,
  });
  const request: HttpRequest = {
    method: "POST",
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    path: url.pathname,
    query: {},
    headers: { "content-type": "application/json", host: url.host },
    body: "{}",
  };
  const signed = await signer.sign(request);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: signed.headers as Record<string, string>,
    body: "{}",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

export async function getAccountInformation(): Promise<{
  info?: AccountInformation;
  error?: string;
}> {
  try {
    const data = await accountApi("getAccountInformation");
    const created = data.AccountCreatedDate;
    const createdDate =
      typeof created === "number"
        ? new Date(created * 1000).toISOString()
        : typeof created === "string"
          ? created
          : null;
    return {
      info: {
        accountId: String(data.AccountId ?? ""),
        accountName: String(data.AccountName ?? ""),
        accountState: String(data.AccountState ?? ""),
        createdDate,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getContactInformation(): Promise<ContactInformation | null> {
  try {
    const out = await accountClient().send(new GetContactInformationCommand({}));
    const c = out.ContactInformation;
    if (!c) return null;
    return {
      fullName: c.FullName ?? "",
      companyName: c.CompanyName ?? "",
      addressLine1: c.AddressLine1 ?? "",
      addressLine2: c.AddressLine2 ?? "",
      addressLine3: c.AddressLine3 ?? "",
      city: c.City ?? "",
      stateOrRegion: c.StateOrRegion ?? "",
      postalCode: c.PostalCode ?? "",
      countryCode: c.CountryCode ?? "",
      phoneNumber: c.PhoneNumber ?? "",
      websiteUrl: c.WebsiteUrl ?? "",
    };
  } catch {
    return null;
  }
}

export async function listRegions(): Promise<RegionStatus[]> {
  try {
    const client = accountClient();
    const regions: RegionStatus[] = [];
    let token: string | undefined;
    do {
      const out = await client.send(
        new ListRegionsCommand({ MaxResults: 50, NextToken: token }),
      );
      for (const r of out.Regions ?? []) {
        regions.push({ name: r.RegionName ?? "", status: r.RegionOptStatus ?? "" });
      }
      token = out.NextToken;
    } while (token);
    return regions.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
