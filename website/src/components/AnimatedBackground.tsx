"use client";

import { useEffect } from "react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export function AnimatedBackground() {
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20, mass: 0.5 });

  const orb1X = useTransform(smoothX, [0, 1], [-40, 40]);
  const orb1Y = useTransform(smoothY, [0, 1], [-30, 30]);
  const orb2X = useTransform(smoothX, [0, 1], [30, -30]);
  const orb2Y = useTransform(smoothY, [0, 1], [20, -20]);
  const orb3X = useTransform(smoothX, [0, 1], [-20, 20]);
  const orb3Y = useTransform(smoothY, [0, 1], [25, -25]);

  const spotlightLeft = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const spotlightTop = useTransform(smoothY, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    if (reduceMotion) return;
    const handle = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-conic-flow opacity-[0.35]" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_90%)]" />

      <m.div
        style={reduceMotion ? undefined : { x: orb1X, y: orb1Y }}
        className="absolute -top-40 -left-32 size-[560px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.18_277/0.32),transparent_65%)] blur-3xl bg-blob-pulse"
      />
      <m.div
        style={reduceMotion ? undefined : { x: orb2X, y: orb2Y }}
        className="absolute top-[15%] -right-40 size-[640px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.18_310/0.22),transparent_65%)] blur-3xl bg-blob-pulse"
      />
      <m.div
        style={reduceMotion ? undefined : { x: orb3X, y: orb3Y }}
        className="absolute bottom-[-15%] left-[15%] size-[520px] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.20_255/0.20),transparent_65%)] blur-3xl bg-blob-pulse"
      />

      {!reduceMotion && (
        <m.div
          style={{ left: spotlightLeft, top: spotlightTop }}
          className="absolute -translate-x-1/2 -translate-y-1/2 size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.7_0.18_280/0.10),transparent_60%)] blur-2xl"
        />
      )}

      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-noise" />
    </div>
  );
}
