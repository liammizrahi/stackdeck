"use client";

import Input, { type InputProps } from "@cloudscape-design/components/input";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ServiceIcon from "@/components/ServiceIcon";
import { addRecent } from "@/lib/recent";
import { searchServices } from "@/lib/services-search";
import type { ServiceInfo } from "@/lib/services";

interface PanelRect {
  top: number;
  left: number;
  width: number;
}

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [rect, setRect] = useState<PanelRect | null>(null);
  const inputRef = useRef<InputProps.Ref>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const query = value.trim();
  const results = searchServices(value);
  const showPanel = open && query !== "" && results.length > 0;

  useEffect(() => {
    if (!showPanel) return;
    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(960, window.innerWidth - r.left - 24);
      setRect({ top: r.bottom + 8, left: r.left, width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showPanel]);

  useEffect(() => {
    setHighlighted(0);
  }, [value]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyS") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (service: ServiceInfo) => {
    addRecent(service.key);
    setValue("");
    setOpen(false);
    router.push(service.href);
  };

  const onKeyDown = (event: CustomEvent<InputProps.KeyDetail>) => {
    if (!showPanel) return;
    switch (event.detail.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((i) => (i + 1) % results.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((i) => (i - 1 + results.length) % results.length);
        break;
      case "Enter": {
        const service = results[highlighted];
        if (service) select(service);
        break;
      }
      case "Escape":
        setOpen(false);
        break;
    }
  };

  return (
    <div className="sd-search" ref={wrapperRef}>
      <Input
        ref={inputRef}
        type="search"
        ariaLabel="Search services"
        placeholder="Search"
        value={value}
        onChange={({ detail }) => {
          setValue(detail.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {value === "" && (
        <span className="sd-search-shortcut" aria-hidden="true">
          [Option+S]
        </span>
      )}
      {showPanel &&
        rect &&
        createPortal(
          <div
            className="sd-search-panel"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <div className="sd-search-head">
              Search results for <strong>&lsquo;{query}&rsquo;</strong>
            </div>
            <div className="sd-search-body">
              <nav className="sd-search-rail" aria-hidden="true">
                <span className="sd-search-rail-item sd-search-rail-active">
                  Services <span className="sd-search-rail-count">({results.length})</span>
                </span>
              </nav>
              <div className="sd-search-results">
                <div className="sd-search-section-title">Services</div>
                <ul role="listbox" aria-label="Service results">
                  {results.map((service, index) => (
                    <li key={service.key} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === highlighted}
                        className={
                          "sd-search-card" +
                          (index === highlighted ? " sd-search-card-active" : "")
                        }
                        onMouseEnter={() => setHighlighted(index)}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          select(service);
                        }}
                      >
                        <ServiceIcon service={service.key} size={32} />
                        <span className="sd-search-card-text">
                          <span className="sd-search-card-name">{service.name}</span>
                          <span className="sd-search-card-desc">
                            {service.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
