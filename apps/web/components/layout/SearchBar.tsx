"use client";

import Input, { type InputProps } from "@cloudscape-design/components/input";
import { useEffect, useRef, useState } from "react";

export default function SearchBar() {
  const [value, setValue] = useState("");
  const ref = useRef<InputProps.Ref>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyS") {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="sd-search">
      <Input
        ref={ref}
        type="search"
        ariaLabel="Search"
        placeholder="Search"
        value={value}
        onChange={({ detail }) => setValue(detail.value)}
      />
      <span className="sd-search-shortcut" aria-hidden="true">
        [Option+S]
      </span>
    </div>
  );
}
