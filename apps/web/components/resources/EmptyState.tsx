"use client";

import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";

export default function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box textAlign="center" color="inherit" padding="l">
      <SpaceBetween size="xs">
        <Box variant="strong" color="inherit">
          {title}
        </Box>
        {subtitle ? (
          <Box variant="p" color="inherit">
            {subtitle}
          </Box>
        ) : null}
        {action}
      </SpaceBetween>
    </Box>
  );
}
