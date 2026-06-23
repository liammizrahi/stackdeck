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
}: {
  endpoint: string;
  region: string;
  accessKeyId: string;
}) {
  const router = useRouter();

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
          text: accessKeyId,
          description: endpoint,
          iconName: "user-profile",
          ariaLabel: "Account",
          onItemClick: ({ detail }) => {
            if (detail.id === "settings") router.push("/settings");
          },
          items: [
            { id: "access-key", text: `Access key: ${accessKeyId}` },
            { id: "endpoint", text: endpoint },
            { id: "settings", text: "Connection settings" },
          ],
        },
      ]}
    />
  );
}
