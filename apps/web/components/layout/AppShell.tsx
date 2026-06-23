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
  accessKeyId,
  accountName,
  accountId,
  children,
}: {
  endpoint: string;
  region: string;
  accessKeyId: string;
  accountName: string;
  accountId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(!isHome);
  }, [isHome]);

  useEffect(() => {
    const open = () => setNavOpen(true);
    window.addEventListener("stackdeck:open-nav", open);
    return () => window.removeEventListener("stackdeck:open-nav", open);
  }, []);

  return (
    <>
      <div id="top-nav">
        <Topbar
          endpoint={endpoint}
          region={region}
          accessKeyId={accessKeyId}
          accountName={accountName}
          accountId={accountId}
        />
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
