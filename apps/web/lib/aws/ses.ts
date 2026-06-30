import {
  GetAccountCommand,
  GetEmailIdentityCommand,
  ListEmailIdentitiesCommand,
  SESv2Client,
} from "@aws-sdk/client-sesv2";
import { clientConfig } from "@/lib/aws/config";

export interface EmailIdentity {
  name: string;
  type: string;
  verified: boolean;
  verificationStatus: string;
  sendingEnabled: boolean;
}

export interface EmailIdentityTag {
  key: string;
  value: string;
}

export interface EmailIdentityDetail extends EmailIdentity {
  dkimStatus: string;
  dkimSigningEnabled: boolean;
  dkimTokens: string[];
  mailFromDomain: string;
  feedbackForwarding: boolean;
  tags: EmailIdentityTag[];
}

export interface AccountInfo {
  sendingEnabled: boolean;
  productionAccessEnabled: boolean;
  max24HourSend: number;
  maxSendRate: number;
  sentLast24Hours: number;
}

function sesClient() {
  return new SESv2Client(clientConfig());
}

export async function listIdentities(): Promise<EmailIdentity[]> {
  const client = sesClient();
  const identities: EmailIdentity[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListEmailIdentitiesCommand({ NextToken: nextToken }),
    );
    for (const i of out.EmailIdentities ?? []) {
      identities.push({
        name: i.IdentityName ?? "",
        type: i.IdentityType ?? "",
        verified: i.VerificationStatus === "SUCCESS",
        verificationStatus: i.VerificationStatus ?? "",
        sendingEnabled: Boolean(i.SendingEnabled),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return identities.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAccount(): Promise<AccountInfo | null> {
  try {
    const out = await sesClient().send(new GetAccountCommand({}));
    return {
      sendingEnabled: Boolean(out.SendingEnabled),
      productionAccessEnabled: Boolean(out.ProductionAccessEnabled),
      max24HourSend: out.SendQuota?.Max24HourSend ?? 0,
      maxSendRate: out.SendQuota?.MaxSendRate ?? 0,
      sentLast24Hours: out.SendQuota?.SentLast24Hours ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getIdentity(
  name: string,
): Promise<{ identity?: EmailIdentityDetail; error?: string }> {
  try {
    const out = await sesClient().send(
      new GetEmailIdentityCommand({ EmailIdentity: name }),
    );
    const tags: EmailIdentityTag[] = (out.Tags ?? []).map((t) => ({
      key: t.Key ?? "",
      value: t.Value ?? "",
    }));
    return {
      identity: {
        name,
        type: out.IdentityType ?? "",
        verified: Boolean(out.VerifiedForSendingStatus),
        verificationStatus: out.VerificationStatus ?? "",
        sendingEnabled: Boolean(out.VerifiedForSendingStatus),
        dkimStatus: out.DkimAttributes?.Status ?? "",
        dkimSigningEnabled: Boolean(out.DkimAttributes?.SigningEnabled),
        dkimTokens: out.DkimAttributes?.Tokens ?? [],
        mailFromDomain: out.MailFromAttributes?.MailFromDomain ?? "",
        feedbackForwarding: Boolean(out.FeedbackForwardingStatus),
        tags,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
