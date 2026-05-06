"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { DemoModal } from "@/components/DemoModal";
import { Hero } from "@/components/Hero";
import { HotkeyHint, type PressedKeys } from "@/components/HotkeyHint";
import { MobileNotice } from "@/components/MobileNotice";
import { RegionSelector } from "@/components/RegionSelector";
import { SCENARIOS, pickRandomScenario } from "@/components/scenarios";
import type { Scenario } from "@/components/PopupPreview";
import { EASE } from "@/components/motion-tokens";

type Phase = "idle" | "selecting" | "opened" | "confirming";

type DemoState = {
  phase: Phase;
  scenario: Scenario;
  capturedImage: string | null;
  flash: boolean;
};

type DemoAction =
  | { type: "startSelection"; nextScenario: Scenario }
  | { type: "cancelSelection" }
  | { type: "captureStarted" }
  | { type: "flashEnded" }
  | { type: "captureCompleted"; image: string | null }
  | { type: "createIssue" }
  | { type: "close" };

const initialState: DemoState = {
  phase: "idle",
  scenario: SCENARIOS[0],
  capturedImage: null,
  flash: false,
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "startSelection":
      return {
        ...state,
        phase: "selecting",
        scenario: action.nextScenario,
        capturedImage: null,
      };
    case "cancelSelection":
      return { ...state, phase: "idle" };
    case "captureStarted":
      return { ...state, phase: "idle", flash: true };
    case "flashEnded":
      return { ...state, flash: false };
    case "captureCompleted":
      return { ...state, capturedImage: action.image, phase: "opened" };
    case "createIssue":
      return { ...state, phase: "confirming" };
    case "close":
      return { ...state, phase: "idle" };
    default:
      return state;
  }
}

const FLASH_DURATION_MS = 220;
const POPUP_OPEN_DELAY_MS = 180;

export function HomeClient() {
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const [pressedKeys, setPressedKeys] = useState<PressedKeys>({
    meta: false,
    shift: false,
    l: false,
  });

  const { phase, scenario, capturedImage, flash } = state;

  const startSelection = useCallback(() => {
    dispatch({
      type: "startSelection",
      nextScenario: pickRandomScenario(scenario),
    });
  }, [scenario]);

  const cancelSelection = useCallback(() => {
    dispatch({ type: "cancelSelection" });
  }, []);

  const closePopup = useCallback(() => {
    dispatch({ type: "close" });
  }, []);

  const onCreateIssue = useCallback(() => {
    dispatch({ type: "createIssue" });
  }, []);

  const handleCapture = useCallback(
    async (rect: { x: number; y: number; w: number; h: number }) => {
      dispatch({ type: "captureStarted" });
      window.setTimeout(() => dispatch({ type: "flashEnded" }), FLASH_DURATION_MS);

      let image: string | null = null;
      try {
        const { default: html2canvas } = await import("html2canvas-pro");
        const dpr = window.devicePixelRatio || 1;
        const canvas = await html2canvas(document.body, {
          x: rect.x + window.scrollX,
          y: rect.y + window.scrollY,
          width: rect.w,
          height: rect.h,
          scale: dpr,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          ignoreElements: (el) => el.hasAttribute("data-capture-ignore"),
        });
        image = canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Capture failed:", err);
      }

      window.setTimeout(
        () => dispatch({ type: "captureCompleted", image }),
        POPUP_OPEN_DELAY_MS,
      );
    },
    [],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      const shift = e.shiftKey;
      const l = e.key.toLowerCase() === "l";

      setPressedKeys({ meta, shift, l });

      if (meta && shift && l) {
        e.preventDefault();
        if (phase === "idle") startSelection();
      }
      if (e.key === "Escape" && (phase === "opened" || phase === "confirming")) {
        closePopup();
      }
    }
    function resetKeys() {
      setPressedKeys({ meta: false, shift: false, l: false });
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", resetKeys);
    window.addEventListener("blur", resetKeys);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", resetKeys);
      window.removeEventListener("blur", resetKeys);
    };
  }, [phase, startSelection, closePopup]);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <MobileNotice />

      <div className="hidden sm:flex h-full w-full flex-col items-center justify-start px-6 pt-[8vh] sm:pt-[10vh]">
        <Hero />
        <HotkeyHint pressedKeys={pressedKeys} onActivate={startSelection} />

        <AnimatePresence>
          {phase === "selecting" && (
            <RegionSelector
              key="selector"
              onCapture={handleCapture}
              onCancel={cancelSelection}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flash && !reduceMotion && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.32, ease: EASE.smooth } }}
              transition={{ duration: 0.08, ease: "easeOut" }}
              data-capture-ignore="true"
              className="pointer-events-none fixed inset-0 z-50 bg-white/15"
            />
          )}
        </AnimatePresence>

        <DemoModal
          phase={phase}
          scenario={scenario}
          capturedImage={capturedImage}
          onCreateIssue={onCreateIssue}
          onClose={closePopup}
        />
      </div>
    </main>
  );
}
