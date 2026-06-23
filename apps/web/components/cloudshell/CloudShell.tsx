"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";

interface Line {
  kind: "command" | "stdout" | "stderr";
  text: string;
}

interface Session {
  id: number;
  lines: Line[];
  input: string;
  history: string[];
  historyIndex: number | null;
  running: boolean;
}

interface ShellResponse {
  stdout?: string;
  stderr?: string;
  code?: number;
  error?: string;
}

const blankSession = (id: number): Session => ({
  id,
  lines: [],
  input: "",
  history: [],
  historyIndex: null,
  running: false,
});

const PromptIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    focusable="false"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
    <path d="M4 6l2.5 2L4 10" />
    <path d="M8 10h4" />
  </svg>
);

export default function CloudShell({ region }: { region: string }) {
  const [open, setOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(() => [blankSession(0)]);
  const [activeId, setActiveId] = useState(0);
  const idRef = useRef(1);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0]!;
  const tabLabel = region || "shell";

  useEffect(() => {
    const openShell = () => setOpen(true);
    window.addEventListener("stackdeck:open-cloudshell", openShell);
    return () => window.removeEventListener("stackdeck:open-cloudshell", openShell);
  }, []);

  useEffect(() => {
    const el = termRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active.lines, active.running, open, activeId]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, activeId]);

  const updateSession = (id: number, patch: Partial<Session>) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const appendLines = (id: number, next: Line[]) =>
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lines: [...s.lines, ...next] } : s)),
    );

  const run = async (id: number, command: string) => {
    updateSession(id, { running: true });
    appendLines(id, [{ kind: "command", text: command }]);
    try {
      const res = await fetch("/api/cloudshell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = (await res.json()) as ShellResponse;
      const out: Line[] = [];
      if (data.stdout) out.push({ kind: "stdout", text: data.stdout });
      if (data.stderr) out.push({ kind: "stderr", text: data.stderr });
      if (data.error) out.push({ kind: "stderr", text: data.error });
      appendLines(id, out);
    } catch {
      appendLines(id, [{ kind: "stderr", text: "Failed to reach CloudShell backend" }]);
    } finally {
      updateSession(id, { running: false });
    }
  };

  const submit = () => {
    const command = active.input.trim();
    if (!command || active.running) return;
    updateSession(active.id, {
      input: "",
      historyIndex: null,
      history: [...active.history, command],
    });
    void run(active.id, command);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }
    if (event.key === "ArrowUp") {
      if (active.history.length === 0) return;
      event.preventDefault();
      const next =
        active.historyIndex === null
          ? active.history.length - 1
          : Math.max(0, active.historyIndex - 1);
      updateSession(active.id, { historyIndex: next, input: active.history[next] ?? "" });
      return;
    }
    if (event.key === "ArrowDown") {
      if (active.historyIndex === null) return;
      event.preventDefault();
      const next = active.historyIndex + 1;
      if (next >= active.history.length) {
        updateSession(active.id, { historyIndex: null, input: "" });
      } else {
        updateSession(active.id, { historyIndex: next, input: active.history[next] ?? "" });
      }
    }
  };

  const addTab = () => {
    const id = idRef.current++;
    setSessions((prev) => [...prev, blankSession(id)]);
    setActiveId(id);
  };

  const closeTab = (id: number) => {
    if (sessions.length <= 1) return;
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    if (id === activeId) setActiveId(next[0]!.id);
  };

  const confirmCloseSession = () => {
    setConfirmClose(false);
    setOpen(false);
    const id = idRef.current++;
    setSessions([blankSession(id)]);
    setActiveId(id);
  };

  return (
    <div className={`sd-shell${open ? " sd-shell-open" : ""}`}>
      {open && (
        <div className="sd-shell-panel">
          <div className="sd-shell-head">
            <div className="sd-shell-tabs">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`sd-shell-tab${s.id === activeId ? " sd-shell-tab-active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(s.id)}
                >
                  <span>{tabLabel}</span>
                  {sessions.length > 1 && (
                    <span
                      className="sd-shell-tab-x"
                      role="button"
                      tabIndex={0}
                      aria-label="Close tab"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeTab(s.id);
                      }}
                    >
                      ✕
                    </span>
                  )}
                </div>
              ))}
              <button className="sd-shell-tab-add" aria-label="New tab" onClick={addTab}>
                +
              </button>
            </div>
            <button
              className="sd-shell-x"
              aria-label="Close CloudShell"
              onClick={() => setConfirmClose(true)}
            >
              ✕
            </button>
          </div>
          <div
            className="sd-shell-term"
            ref={termRef}
            onClick={() => inputRef.current?.focus()}
          >
            {active.lines.map((line, index) => (
              <pre key={index} className={`sd-shell-line sd-shell-${line.kind}`}>
                {line.kind === "command" ? `~ $ ${line.text}` : line.text}
              </pre>
            ))}
            {active.running ? (
              <pre className="sd-shell-line sd-shell-stdout">…</pre>
            ) : (
              <div className="sd-shell-promptline">
                <span className="sd-shell-sigil">~ $</span>
                <input
                  ref={inputRef}
                  className="sd-shell-input"
                  value={active.input}
                  onChange={(event) => updateSession(active.id, { input: event.target.value })}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="CloudShell command input"
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="sd-shell-strip">
        <button
          className="sd-shell-strip-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span className="sd-shell-strip-icon">
            <PromptIcon />
          </span>
          CloudShell
        </button>
        <div className="sd-shell-strip-credits">
          <Link external href="https://github.com/liammizrahi/stackdeck" variant="secondary">
            GitHub
          </Link>
          <span>© 2026 StackDeck</span>
        </div>
      </div>

      {confirmClose && (
        <Modal
          visible
          onDismiss={() => setConfirmClose(false)}
          header="Close CloudShell?"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setConfirmClose(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={confirmCloseSession}>
                  Close session
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          Closing CloudShell ends your shell session. Your command history and any
          running command will be lost.
        </Modal>
      )}
    </div>
  );
}
