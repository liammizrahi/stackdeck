"use client";

import TopNavigation from "@cloudscape-design/components/top-navigation";
import { withBase } from "@/lib/base-path";

const REPO_URL = "https://github.com/liammizrahi/stackdeck";

export default function DocsTopNav() {
  return (
    <TopNavigation
      identity={{
        href: withBase("/"),
        logo: { src: withBase("/stackdeck-logo.svg"), alt: "StackDeck" },
      }}
      utilities={[
        {
          type: "button",
          text: "Documentation",
          href: withBase("/"),
        },
        {
          type: "button",
          text: "MiniStack",
          external: true,
          href: "https://ministack.org/docs/",
          externalIconAriaLabel: "(opens in new tab)",
        },
        {
          type: "button",
          text: "GitHub",
          iconName: "star",
          href: REPO_URL,
          external: true,
          externalIconAriaLabel: "(opens in new tab)",
          ariaLabel: "GitHub repository",
          title: "GitHub repository",
        },
      ]}
    />
  );
}
