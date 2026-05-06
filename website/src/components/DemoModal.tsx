"use client";

import { AnimatePresence, m } from "framer-motion";
import { DownloadConfirm } from "@/components/DownloadConfirm";
import { PopupPreview } from "@/components/PopupPreview";
import type { Scenario } from "@/components/PopupPreview";
import { EASE, SPRING } from "@/components/motion-tokens";

type DemoPhase = "idle" | "selecting" | "opened" | "confirming";

const CLOSE_DURATION = 0.22;

export function DemoModal({
  phase,
  scenario,
  capturedImage,
  onCreateIssue,
  onClose,
}: {
  phase: DemoPhase;
  scenario: Scenario;
  capturedImage: string | null;
  onCreateIssue: () => void;
  onClose: () => void;
}) {
  const isOpen = phase === "opened" || phase === "confirming";

  // Single, flat AnimatePresence — backdrop and card are siblings, not nested,
  // so each one's exit animation fires independently when isOpen flips false.
  // Nested AnimatePresence + conditionally-mounted parent breaks exit timing
  // (see motiondivision/motion#1682).
  return (
    <AnimatePresence>
      {isOpen && (
        <m.button
          key="backdrop"
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          data-capture-ignore="true"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
            transition: { duration: CLOSE_DURATION, ease: EASE.smooth },
          }}
          transition={{ duration: 0.4, ease: EASE.smooth }}
          className="fixed inset-0 z-30 bg-black/55 cursor-default"
          style={{ WebkitBackdropFilter: "blur(10px)" }}
        />
      )}

      {phase === "opened" && (
        <m.div
          key="popup"
          data-capture-ignore="true"
          initial={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              ...SPRING.popup,
              opacity: { duration: 0.3, ease: EASE.out },
              filter: { duration: 0.4, ease: EASE.out },
            },
          }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.96,
            transition: {
              duration: CLOSE_DURATION,
              ease: EASE.in,
            },
          }}
          style={{ transformOrigin: "center center" }}
          className="fixed inset-0 z-30 flex items-center justify-center px-4 pointer-events-none"
        >
          <div className="relative pointer-events-auto">
            <PopupPreview
              scenario={scenario}
              capturedImage={capturedImage}
              onCreateIssue={onCreateIssue}
              onClose={onClose}
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Press</span>
              <kbd className="inline-flex items-center justify-center h-[20px] px-2 rounded border border-border bg-card/80 backdrop-blur font-mono text-[11px] text-muted-foreground">
                Esc
              </kbd>
              <span>to close</span>
            </div>
          </div>
        </m.div>
      )}

      {phase === "confirming" && (
        <m.div
          key="confirm"
          data-capture-ignore="true"
          initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              ...SPRING.pop,
              opacity: { duration: 0.25, ease: EASE.out },
              filter: { duration: 0.3, ease: EASE.out },
            },
          }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.96,
            transition: {
              duration: CLOSE_DURATION,
              ease: EASE.in,
            },
          }}
          style={{ transformOrigin: "center center" }}
          className="fixed inset-0 z-30 flex items-center justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto">
            <DownloadConfirm
              scenario={scenario}
              capturedImage={capturedImage}
              onClose={onClose}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
