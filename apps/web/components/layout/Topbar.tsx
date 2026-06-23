"use client";

import TopNavigation from "@cloudscape-design/components/top-navigation";

export default function Topbar({
  endpoint,
  region,
}: {
  endpoint: string;
  region: string;
}) {
  return (
    <TopNavigation
      identity={{ href: "/", title: "StackDeck" }}
      utilities={[
        { type: "button", text: region, iconName: "globe" },
        { type: "button", text: endpoint, iconName: "share" },
      ]}
    />
  );
}
