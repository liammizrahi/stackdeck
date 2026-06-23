"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type { AwsSettings } from "@/lib/aws/config";
import { resetSettingsAction, saveSettingsAction } from "./actions";

export default function SettingsForm({
  settings,
}: {
  settings: AwsSettings;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [endpoint, setEndpoint] = useState(settings.endpoint);
  const [region, setRegion] = useState(settings.region);
  const [accessKeyId, setAccessKeyId] = useState(settings.accessKeyId);
  const [secretAccessKey, setSecretAccessKey] = useState(
    settings.secretAccessKey,
  );
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await saveSettingsAction({
        endpoint,
        region,
        accessKeyId,
        secretAccessKey,
      });
      if (result.ok) {
        setStatus({ type: "success", message: "Connection settings saved." });
        router.refresh();
      } else {
        setStatus({
          type: "error",
          message: result.error ?? "Failed to save settings",
        });
      }
    });
  };

  const reset = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await resetSettingsAction();
      if (result.ok) {
        setStatus({
          type: "success",
          message: "Reset to defaults (environment / built-in values).",
        });
        router.refresh();
      } else {
        setStatus({
          type: "error",
          message: result.error ?? "Failed to reset settings",
        });
      }
    });
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Point StackDeck at any LocalStack or MiniStack endpoint. Leave a field blank to fall back to the environment variable or built-in default."
        >
          Connection settings
        </Header>
      }
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={reset} disabled={isPending}>
                Reset to defaults
              </Button>
              <Button variant="primary" loading={isPending} onClick={save}>
                Save changes
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            {status && (
              <Alert
                type={status.type}
                dismissible
                onDismiss={() => setStatus(null)}
              >
                {status.message}
              </Alert>
            )}
            <Container header={<Header variant="h2">AWS connection</Header>}>
              <SpaceBetween size="l">
                <FormField
                  label="Endpoint URL"
                  description="The local AWS endpoint. Default: http://localhost:4566"
                >
                  <Input
                    value={endpoint}
                    onChange={({ detail }) => setEndpoint(detail.value)}
                    placeholder="http://localhost:4566"
                    type="url"
                  />
                </FormField>
                <FormField label="Region" description="Default: us-east-1">
                  <Input
                    value={region}
                    onChange={({ detail }) => setRegion(detail.value)}
                    placeholder="us-east-1"
                  />
                </FormField>
                <FormField
                  label="Access key ID"
                  description="Default: test"
                >
                  <Input
                    value={accessKeyId}
                    onChange={({ detail }) => setAccessKeyId(detail.value)}
                    placeholder="test"
                  />
                </FormField>
                <FormField
                  label="Secret access key"
                  description="Default: test"
                >
                  <Input
                    value={secretAccessKey}
                    onChange={({ detail }) => setSecretAccessKey(detail.value)}
                    type="password"
                    placeholder="test"
                  />
                </FormField>
                <Box variant="small" color="text-status-inactive">
                  Settings apply to every service immediately and persist for this
                  StackDeck instance.
                </Box>
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        </Form>
      </form>
    </ContentLayout>
  );
}
