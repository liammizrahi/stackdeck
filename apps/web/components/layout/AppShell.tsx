"use client";

import { useEffect, useState } from "react";
import AppLayoutToolbar from "@cloudscape-design/components/app-layout-toolbar";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";

export default function AppShell({
  endpoint,
  region,
  children,
}: {
  endpoint: string;
  region: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(!isHome);
  }, [isHome]);

  return (
    <>
      <div id="top-nav">
        <Topbar endpoint={endpoint} region={region} />
      </div>
      <AppLayoutToolbar
        headerSelector="#top-nav"
        contentType={isHome ? "dashboard" : "table"}
        navigation={<Sidebar />}
        navigationOpen={navOpen}
        onNavigationChange={(e) => setNavOpen(e.detail.open)}
        breadcrumbs={isHome ? undefined : <Breadcrumbs />}
        toolsHide
        content={children}
      />
    </>
  );
}
