"use client";

import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import { regionGroups } from "@/lib/aws/regions";

export default function Topbar({
  endpoint,
  region,
}: {
  endpoint: string;
  region: string;
}) {
  const router = useRouter();

  const selectRegion = (code: string) => {
    document.cookie = `stackdeck_region=${code}; path=/; max-age=31536000`;
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
          type: "menu-dropdown",
          iconName: "settings",
          ariaLabel: "Settings",
          title: "Settings",
          items: [
            { id: "endpoint", text: `Endpoint: ${endpoint}` },
            { id: "region", text: `Region: ${region}` },
          ],
        },
        {
          type: "menu-dropdown",
          text: "test",
          description: endpoint,
          iconName: "user-profile",
          ariaLabel: "Account",
          items: [
            { id: "access-key", text: "Access key: test" },
            { id: "endpoint", text: endpoint },
          ],
        },
      ]}
    />
  );
}
