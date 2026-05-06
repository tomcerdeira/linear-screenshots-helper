"use client";

import { m } from "framer-motion";

export type PressedKeys = {
  meta: boolean;
  shift: boolean;
  l: boolean;
};

function KeyCap({
  children,
  pressed,
}: {
  children: React.ReactNode;
  pressed: boolean;
}) {
  return (
    <m.kbd
      animate={{
        y: pressed ? 2 : 0,
        scale: pressed ? 0.95 : 1,
        backgroundColor: pressed ? "oklch(0.62 0.16 277 / 0.25)" : "oklch(0.22 0.008 280)",
        borderColor: pressed ? "oklch(0.62 0.16 277 / 0.6)" : "oklch(1 0 0 / 0.12)",
        color: pressed ? "oklch(0.85 0.08 277)" : "oklch(0.985 0 0)",
        boxShadow: pressed
          ? "0 0 0 1px oklch(0.62 0.16 277 / 0.4), 0 0 20px oklch(0.62 0.16 277 / 0.4)"
          : "0 1px 0 0 oklch(1 0 0 / 0.05), 0 2px 4px oklch(0 0 0 / 0.4)",
      }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="inline-flex items-center justify-center min-w-[44px] h-[44px] px-3 rounded-lg border font-mono text-base font-semibold"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </m.kbd>
  );
}

export function HotkeyHint({
  pressedKeys,
  onActivate,
}: {
  pressedKeys: PressedKeys;
  onActivate: () => void;
}) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[14vh] sm:bottom-[16vh] z-10 flex flex-col items-center">
      <m.button
        type="button"
        onClick={onActivate}
        data-capture-ignore="true"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="group flex flex-col items-center gap-4 cursor-pointer focus:outline-none"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          Try it — press
        </span>
        <div className="flex items-center gap-2">
          <KeyCap pressed={pressedKeys.meta}>⌘</KeyCap>
          <span className="text-muted-foreground/40 text-lg">+</span>
          <KeyCap pressed={pressedKeys.shift}>⇧</KeyCap>
          <span className="text-muted-foreground/40 text-lg">+</span>
          <KeyCap pressed={pressedKeys.l}>L</KeyCap>
        </div>
        <span className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          or click to preview
        </span>
      </m.button>
    </div>
  );
}
