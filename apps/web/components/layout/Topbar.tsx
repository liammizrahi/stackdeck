"use client";

import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import { regionGroups } from "@/lib/aws/regions";
import { saveSettingsAction } from "@/app/settings/actions";

export default function Topbar({
  endpoint,
  region,
  accessKeyId,
  accountName,
  accountId,
}: {
  endpoint: string;
  region: string;
  accessKeyId: string;
  accountName: string;
  accountId: string;
}) {
  const router = useRouter();
  const accountLabel = accountName.split(" ")[0] || accountName;

  const selectRegion = async (code: string) => {
    await saveSettingsAction({ region: code });
    router.refresh();
  };

  return (
    <TopNavigation
      identity={{
        href: "/",
        logo: { src: "/stackdeck-logo.svg", alt: "StackDeck" },
      }}
      search={<SearchBar />}
      utilities={[
        {
          type: "button",
          text: "GitHub",
          iconName: "star",
          href: "https://github.com/liammizrahi/stackdeck",
          external: true,
          externalIconAriaLabel: "(opens in new tab)",
          ariaLabel: "GitHub repository",
          title: "GitHub repository",
        },
        {
          type: "button",
          iconName: "command-prompt",
          ariaLabel: "Open CloudShell",
          title: "Open CloudShell",
          onClick: () => window.dispatchEvent(new Event("stackdeck:open-cloudshell")),
        },
        {
          type: "button",
          iconName: "notification",
          ariaLabel: "Notifications",
          title: "Notifications",
        },
        {
          type: "menu-dropdown",
          text: region,
          ariaLabel: "Select region",
          title: "Region",
          onItemClick: ({ detail }) => selectRegion(detail.id),
          items: regionGroups.map((group) => ({
            id: group.label,
            text: group.label,
            items: group.regions.map((r) => ({
              id: r.code,
              text: r.name,
              labelTag: r.code,
              disabled: r.code === region,
            })),
          })),
        },
        {
          type: "button",
          iconName: "settings",
          ariaLabel: "Settings",
          title: "Settings",
          onClick: () => router.push("/settings"),
        },
        {
          type: "menu-dropdown",
          text: accountLabel,
          description: endpoint,
          iconName: "user-profile",
          ariaLabel: "Account",
          onItemClick: ({ detail }) => {
            if (detail.id === "account") router.push("/account");
            if (detail.id === "settings") router.push("/settings");
          },
          items: [
            { id: "account", text: "Account" },
            { id: "settings", text: "Connection settings" },
            {
              id: "connection",
              text: "Connection",
              items: [
                { id: "account-id", text: `Account ID: ${accountId || "—"}` },
                { id: "endpoint", text: `Endpoint: ${endpoint}` },
                { id: "region", text: `Region: ${region}` },
                { id: "access-key", text: `Access key: ${accessKeyId}` },
              ],
            },
            {
              id: "support",
              text: "Support",
              items: [
                {
                  id: "docs",
                  text: "MiniStack documentation",
                  href: "https://ministack.org/docs/",
                  external: true,
                  externalIconAriaLabel: "(opens in new tab)",
                },
                {
                  id: "github",
                  text: "GitHub",
                  href: "https://github.com/liammizrahi/stackdeck",
                  external: true,
                  externalIconAriaLabel: "(opens in new tab)",
                },
                {
                  id: "issue",
                  text: "Report an issue",
                  href: "https://github.com/liammizrahi/stackdeck/issues",
                  external: true,
                  externalIconAriaLabel: "(opens in new tab)",
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}
