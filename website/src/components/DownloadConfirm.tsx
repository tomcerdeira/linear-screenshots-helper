"use client";

import Image from "next/image";
import { m, type Variants } from "framer-motion";
import type { Scenario } from "./PopupPreview";
import { DMG_ARM64_URL, DMG_X64_URL, REPO_URL } from "@/lib/links";

function hashIssueNumber(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 900) + 100;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

export function DownloadConfirm({
  scenario,
  capturedImage,
  onClose,
}: {
  scenario: Scenario;
  capturedImage?: string | null;
  onClose: () => void;
}) {
  const issueNumber = hashIssueNumber(scenario.title);

  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-[440px] max-w-[92vw] rounded-2xl border bg-card overflow-hidden"
      style={{
        borderColor: "oklch(1 0 0 / 0.1)",
        boxShadow:
          "0 30px 80px rgba(94, 106, 210, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6)",
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.18_277/0.25),transparent_70%)] blur-2xl" />

      <div className="flex flex-col items-center gap-4 px-8 pt-9 pb-6">
        <div className="relative size-14">
          <m.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.6], opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT, times: [0, 0.4, 1] }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.62 0.18 277 / 0.6), transparent 70%)",
            }}
          />

          <m.div
            initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 22,
              mass: 0.8,
              delay: 0.05,
            }}
            className="relative size-full rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 277), oklch(0.55 0.20 260))",
              boxShadow:
                "0 0 0 1px oklch(1 0 0 / 0.12) inset, 0 6px 24px rgba(94, 106, 210, 0.5)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
              className="size-7"
            >
              <m.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { duration: 0.45, delay: 0.32, ease: EASE_OUT },
                  opacity: { duration: 0.1, delay: 0.32 },
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </m.div>
        </div>

        <m.div variants={itemVariants} className="text-center">
          <h3 className="text-lg font-semibold text-foreground tracking-tight">
            Issue created
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            That&apos;s how fast it works.
          </p>
        </m.div>
      </div>

      <m.div
        variants={itemVariants}
        className="mx-5 mb-5 rounded-lg border bg-background/60 backdrop-blur-sm p-3 flex items-center gap-3"
        style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
      >
        {capturedImage ? (
          <Image
            src={capturedImage}
            alt="Captured region"
            width={40}
            height={40}
            unoptimized
            className="size-10 rounded object-cover border shrink-0"
            style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
          />
        ) : (
          <div
            className="size-10 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #6c78e0, #5e6ad2)",
            }}
          >
            {scenario.teamKey[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-mono text-muted-foreground truncate">
            {scenario.teamKey}-{issueNumber}
          </div>
          <div className="text-sm font-medium text-foreground truncate">
            {scenario.title}
          </div>
        </div>
        <div
          className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            background: "oklch(0.62 0.16 277 / 0.15)",
            color: "oklch(0.85 0.08 277)",
            border: "1px solid oklch(0.62 0.16 277 / 0.3)",
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: "oklch(0.62 0.16 277)" }}
          />
          New
        </div>
      </m.div>

      <m.div
        variants={itemVariants}
        className="border-t px-6 py-5 flex flex-col gap-3"
        style={{ borderColor: "oklch(1 0 0 / 0.06)" }}
      >
        <p className="text-sm text-center text-muted-foreground">
          Want this for real? Download the app and start capturing.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={DMG_ARM64_URL}
            download
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium text-white transition-[transform,box-shadow] duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "oklch(0.62 0.16 277)",
              boxShadow:
                "0 0 0 1px oklch(1 0 0 / 0.08) inset, 0 4px 14px rgba(94,106,210,0.4)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download for macOS
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium border bg-background hover:bg-muted transition-colors"
            style={{ borderColor: "oklch(1 0 0 / 0.12)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
        <p className="text-[11px] text-center text-muted-foreground">
          Apple Silicon · {" "}
          <a href={DMG_X64_URL} download className="underline hover:text-foreground transition-colors">
            Intel Mac?
          </a>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Maybe later
        </button>
      </m.div>
    </m.div>
  );
}
