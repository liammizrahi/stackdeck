import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Skeleton from "@cloudscape-design/components/skeleton";
import SpaceBetween from "@cloudscape-design/components/space-between";

export default function Loading() {
  return (
    <SpaceBetween size="l">
      <Skeleton variant="text-heading-l" width="260px" />
      <Container
        header={
          <Header variant="h2">
            <Skeleton width="180px" />
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Skeleton width="320px" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
