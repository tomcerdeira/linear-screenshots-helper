"use client";

import { REPO_URL } from "@/lib/links";
import { m } from "framer-motion";

export function MobileNotice() {
  return (
    <div className="sm:hidden fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        <div
          className="size-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.18 277), oklch(0.55 0.20 260))",
            boxShadow:
              "0 0 0 1px oklch(1 0 0 / 0.12) inset, 0 8px 32px rgba(94, 106, 210, 0.4)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            className="size-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold tracking-tight leading-tight">
            Linear on mobile?
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            You&apos;re a brave one, champ. This app only runs on{" "}
            <span className="text-foreground font-medium">macOS</span>.
            Come back from your desk.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium border bg-card hover:bg-muted transition-colors"
            style={{ borderColor: "oklch(1 0 0 / 0.12)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Star it on GitHub
          </a>
          <p className="text-xs text-muted-foreground/60">
            Open this on a Mac to see the demo.
          </p>
        </div>
      </m.div>
    </div>
  );
}
