"use client";

import { useEffect, useRef } from "react";

type HubSpotEmbedProps = {
  region: string;
  formId: string;
  portalId: string;
  className?: string;
};

declare global {
  interface Window {
    __HS__FORMS__EMBED__?: unknown;
  }
}

/**
 * HubSpot V4 scans the DOM when its script runs. With Next.js + `afterInteractive`,
 * client-rendered placeholders can still occasionally miss the first pass. Once
 * `window.__HS__FORMS__EMBED__` exists, a single re-parent emits `childList` mutations
 * so HubSpot's observer attaches the iframe (skipped if an iframe is already present).
 */
export default function HubSpotEmbed({
  region,
  formId,
  portalId,
  className,
}: HubSpotEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 120;
    let kicked = false;

    const id = window.setInterval(() => {
      if (cancelled) return;
      if (el.querySelector("iframe")) {
        window.clearInterval(id);
        return;
      }

      attempts += 1;

      if (window.__HS__FORMS__EMBED__ && !kicked) {
        kicked = true;
        const parent = el.parentElement;
        if (parent) {
          parent.removeChild(el);
          parent.appendChild(el);
        }
        window.clearInterval(id);
        return;
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(id);
      }
    }, 80);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={["hs-form-frame", className].filter(Boolean).join(" ")}
      data-region={region}
      data-form-id={formId}
      data-portal-id={portalId}
    />
  );
}
