import Box from "@cloudscape-design/components/box";
import Spinner from "@cloudscape-design/components/spinner";

export default function Loading() {
  return (
    <Box padding="l">
      <Spinner size="large" /> Loading…
    </Box>
  );
}
