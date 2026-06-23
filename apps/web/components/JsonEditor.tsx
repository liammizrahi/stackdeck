"use client";

import CodeEditor, {
  type CodeEditorProps,
} from "@cloudscape-design/components/code-editor";
import { useEffect, useState } from "react";

const i18nStrings: CodeEditorProps.I18nStrings = {
  loadingState: "Loading code editor",
  errorState: "There was an error loading the code editor.",
  errorStateRecovery: "Retry",
  editorGroupAriaLabel: "Code editor",
  statusBarGroupAriaLabel: "Status bar",
  cursorPosition: (row, column) => `Ln ${row}, Col ${column}`,
  errorsTab: "Errors",
  warningsTab: "Warnings",
  preferencesButtonAriaLabel: "Preferences",
  paneCloseButtonAriaLabel: "Close",
  preferencesModalHeader: "Preferences",
  preferencesModalCancel: "Cancel",
  preferencesModalConfirm: "Confirm",
  preferencesModalWrapLines: "Wrap lines",
  preferencesModalTheme: "Theme",
  preferencesModalLightThemes: "Light themes",
  preferencesModalDarkThemes: "Dark themes",
};

export default function JsonEditor({
  value,
  onChange,
  language = "json",
}: {
  value: string;
  onChange: (value: string) => void;
  language?: "json" | "text";
}) {
  const [ace, setAce] = useState<CodeEditorProps["ace"]>();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<
    Partial<CodeEditorProps.Preferences> | undefined
  >(undefined);
  const [height, setHeight] = useState(220);

  useEffect(() => {
    let active = true;
    import("ace-builds")
      .then((a) => {
        a.config.set("basePath", "/ace");
        a.config.set("useStrictCSP", true);
        if (active) {
          setAce(a);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <CodeEditor
      ace={ace}
      value={value}
      language={language}
      onDelayedChange={(event) => onChange(event.detail.value)}
      preferences={preferences}
      onPreferencesChange={(event) => setPreferences(event.detail)}
      loading={loading}
      i18nStrings={i18nStrings}
      editorContentHeight={height}
      onEditorContentResize={(event) => setHeight(event.detail.height)}
      themes={{ light: ["dawn"], dark: ["tomorrow_night_bright"] }}
    />
  );
}
