"use client";

import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";

function escapeHtml(code: string): string {
  return code.replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c,
  );
}

export default function CodeEditor({
  value,
  onChange,
  language = "json",
  minHeight = 200,
}: {
  value: string;
  onChange: (value: string) => void;
  language?: "json" | "text" | "sql";
  minHeight?: number;
}) {
  const highlight = (code: string) => {
    const grammar = language === "text" ? undefined : Prism.languages[language];
    return grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code);
  };

  return (
    <div className="sd-code-editor">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={12}
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          minHeight,
        }}
        textareaClassName="sd-code-textarea"
      />
    </div>
  );
}
