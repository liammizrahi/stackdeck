import { NextResponse } from "next/server";
import { runShell } from "@/lib/cloudshell";

export async function POST(request: Request) {
  let command: unknown;
  try {
    ({ command } = (await request.json()) as { command?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof command !== "string" || command.trim() === "") {
    return NextResponse.json({ error: "Empty command" }, { status: 400 });
  }

  const result = await runShell(command);
  return NextResponse.json(result);
}
