"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";

type Point = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

const MIN_SELECTION_PX = 20;

export function RegionSelector({
  onCapture,
  onCancel,
}: {
  onCapture: (rect: Rect) => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState<Point | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // We only need the latest cursor position to compute rect; not for rendering
  // anything by itself, so a ref avoids re-renders on every pointermove.
  const currentRef = useRef<Point | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  function buildRect(a: Point, b: Point): Rect {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    const point = { x: e.clientX, y: e.clientY };
    setStart(point);
    currentRef.current = point;
    setRect({ x: point.x, y: point.y, w: 0, h: 0 });
    containerRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!start) return;
    const point = { x: e.clientX, y: e.clientY };
    currentRef.current = point;
    setRect(buildRect(start, point));
  }

  function onPointerUp() {
    if (!rect || rect.w < MIN_SELECTION_PX || rect.h < MIN_SELECTION_PX) {
      onCancel();
      return;
    }
    onCapture(rect);
  }

  return (
    <m.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      data-capture-ignore="true"
      className="fixed inset-0 z-40"
      style={{ cursor: "crosshair" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="region-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && rect.w > 0 && rect.h > 0 && (
              <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="black" />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#region-mask)"
        />
        {rect && rect.w > 0 && rect.h > 0 && (
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            fill="none"
            stroke="#5e6ad2"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {!start && (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-sm font-medium text-foreground">
              Drag to select a region
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Press</span>
              <kbd className="inline-flex items-center justify-center h-[20px] px-2 rounded border border-border bg-card/80 backdrop-blur font-mono text-[11px] text-muted-foreground">
                Esc
              </kbd>
              <span>to cancel</span>
            </div>
          </div>
        </m.div>
      )}

      {rect && rect.w > 4 && rect.h > 4 && (
        <div
          className="pointer-events-none absolute font-mono text-[11px] text-white bg-black/70 px-1.5 py-0.5 rounded"
          style={{
            left: rect.x + rect.w + 8,
            top: rect.y + rect.h + 8,
          }}
        >
          {Math.round(rect.w)} × {Math.round(rect.h)}
        </div>
      )}
    </m.div>
  );
}
