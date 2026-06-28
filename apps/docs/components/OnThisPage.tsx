"use client";

import AnchorNavigation from "@cloudscape-design/components/anchor-navigation";
import Box from "@cloudscape-design/components/box";
import ExpandableSection from "@cloudscape-design/components/expandable-section";

const anchors = [
  { text: "Overview", href: "#overview", level: 1 },
  { text: "Quick start", href: "#quick-start", level: 1 },
  { text: "Supported services", href: "#services", level: 1 },
  { text: "Deployment", href: "#deployment", level: 1 },
  { text: "Support", href: "#support", level: 1 },
  { text: "Related projects", href: "#related", level: 1 },
];

export default function OnThisPage({ variant }: { variant: "mobile" | "side" }) {
  const anchorNavigation = (
    <AnchorNavigation anchors={anchors} ariaLabelledby="navigation-header" />
  );

  return variant === "side" ? (
    <div className="on-this-page--side" data-testid="on-this-page">
      <Box variant="h2" margin={{ bottom: "xxs" }}>
        <span id="navigation-header">On this page</span>
      </Box>
      {anchorNavigation}
    </div>
  ) : (
    <ExpandableSection
      variant="footer"
      headingTagOverride="h2"
      headerText="On this page"
    >
      {anchorNavigation}
    </ExpandableSection>
  );
}
