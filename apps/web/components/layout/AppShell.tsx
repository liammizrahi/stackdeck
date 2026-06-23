"use client";

import { useEffect, useState } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";
import { applyTheme } from "@cloudscape-design/components/theming";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  endpoint,
  region,
  children,
}: {
  endpoint: string;
  region: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    const reset = applyTheme({
      theme: {
        tokens: {
          fontFamilyBase:
            "var(--font-amazon-ember), 'Amazon Ember', system-ui, sans-serif",
        },
      },
    });
    return () => reset.reset();
  }, []);

  return (
    <>
      <div id="top-nav">
        <Topbar endpoint={endpoint} region={region} />
      </div>
      <AppLayout
        headerSelector="#top-nav"
        navigation={<Sidebar />}
        navigationOpen={navOpen}
        onNavigationChange={(e) => setNavOpen(e.detail.open)}
        toolsHide
        content={children}
      />
    </>
  );
}
