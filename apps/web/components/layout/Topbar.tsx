"use client";

import TopNavigation from "@cloudscape-design/components/top-navigation";
import Input from "@cloudscape-design/components/input";
import { useState } from "react";

export default function Topbar({
  endpoint,
  region,
}: {
  endpoint: string;
  region: string;
}) {
  const [search, setSearch] = useState("");
  return (
    <TopNavigation
      identity={{ href: "/", title: "StackDeck" }}
      search={
        <Input
          type="search"
          ariaLabel="Search"
          placeholder="Search resources"
          value={search}
          onChange={({ detail }) => setSearch(detail.value)}
        />
      }
      utilities={[
        {
          type: "button",
          iconName: "notification",
          ariaLabel: "Notifications",
          title: "Notifications",
        },
        {
          type: "menu-dropdown",
          text: region,
          ariaLabel: "Region",
          title: "Region",
          items: [{ id: region, text: region }],
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
