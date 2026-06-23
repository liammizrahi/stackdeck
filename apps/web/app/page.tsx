"use client";

import { Button } from "@heroui/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-6xl font-bold tracking-tight">StackDeck</h1>
      <p className="text-lg text-foreground-muted">
        Built with Turborepo, Next.js, and HeroUI.
      </p>
      <Button onPress={() => console.log("Get started")}>Get started</Button>
    </main>
  );
}
