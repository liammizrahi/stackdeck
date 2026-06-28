"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Grid from "@cloudscape-design/components/grid";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";

const REPO_URL = "https://github.com/liammizrahi/stackdeck";

export default function HeroHeader() {
  return (
    <Box data-testid="hero-header" padding={{ top: "xs", bottom: "l" }}>
      <Grid
        gridDefinition={[
          { colspan: { default: 12, xs: 8, s: 9 } },
          { colspan: { default: 12, xs: 4, s: 3 } },
        ]}
      >
        <div>
          <Box variant="h1">StackDeck</Box>
          <Box
            variant="p"
            color="text-body-secondary"
            margin={{ top: "xxs", bottom: "s" }}
          >
            The AWS Management Console for your local cloud. StackDeck is a
            self-hosted, open-source web console for MiniStack and LocalStack —
            browse and manage your local AWS resources through a faithful
            recreation of the real AWS Console.
          </Box>
          <SpaceBetween size="xs">
            <div>
              Maintained by:{" "}
              <Link variant="primary" href={REPO_URL} external={true}>
                liammizrahi
              </Link>
            </div>
            <div>Tags: Self-hosted | Open source | Zero config | Docker</div>
          </SpaceBetween>
        </div>

        <Box margin={{ top: "l" }}>
          <SpaceBetween size="s">
            <Button variant="primary" href="#quick-start" fullWidth={true}>
              Get started
            </Button>
            <Button href={REPO_URL} target="_blank" fullWidth={true}>
              View on GitHub
            </Button>
          </SpaceBetween>
        </Box>
      </Grid>
    </Box>
  );
}
