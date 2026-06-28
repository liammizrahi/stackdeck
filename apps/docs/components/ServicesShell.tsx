"use client";

import { useState } from "react";
import AppLayoutToolbar from "@cloudscape-design/components/app-layout-toolbar";
import SideNavigation, {
  type SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";
import { usePathname } from "next/navigation";
import { servicesByCategory } from "@/lib/services";
import { withBase } from "@/lib/base-path";

const navItems: SideNavigationProps.Item[] = [
  { type: "link", text: "All services", href: withBase("/services/") },
  { type: "divider" },
  ...servicesByCategory().map(
    (group): SideNavigationProps.Item => ({
      type: "section",
      text: group.category,
      items: group.items.map((service) => ({
        type: "link",
        text: service.abbr,
        href: withBase(`/services/${service.slug}/`),
      })),
    }),
  ),
];

export default function ServicesShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(true);
  const pathname = pathnameWithSlash(usePathname());

  return (
    <AppLayoutToolbar
      headerSelector="#top-nav"
      contentType="default"
      toolsHide
      navigationOpen={navOpen}
      onNavigationChange={(event) => setNavOpen(event.detail.open)}
      navigation={
        <SideNavigation
          header={{ text: "Services", href: withBase("/services/") }}
          activeHref={withBase(pathname)}
          items={navItems}
        />
      }
      content={children}
    />
  );
}

function pathnameWithSlash(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}
