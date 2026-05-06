export const EASE = {
  // Soft, slightly anticipatory entrance
  out: [0.16, 1, 0.3, 1] as const,
  // Decisive but graceful exit — accelerates without being abrupt
  in: [0.32, 0, 0.67, 0] as const,
  // Symmetric, near-linear — for crossfades and backdrop transitions
  smooth: [0.4, 0, 0.2, 1] as const,
} as const;

export const SPRING = {
  popup: { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.9 },
  pop: { type: "spring" as const, stiffness: 380, damping: 22, mass: 0.7 },
} as const;
