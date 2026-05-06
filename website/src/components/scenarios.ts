import type { Scenario } from "./PopupPreview";

const LABEL_COLORS = {
  bug: "#eb5757",
  feature: "#5e6ad2",
  improvement: "#26b5ce",
  design: "#bd66e0",
  performance: "#f2c94c",
  docs: "#95a2b3",
  copy: "#7cd5b3",
  growth: "#f2994a",
};

const STATUS_COLORS = {
  backlog: "#95a2b3",
  todo: "#e2e2ea",
  inProgress: "#f2c94c",
  inReview: "#26b5ce",
  done: "#5e6ad2",
};

export const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    teamKey: "WEB",
    title: "Hero headline could be tighter",
    description: "The line break feels awkward. Let's try a single line on desktop.",
    status: { type: "backlog", name: "Backlog", color: STATUS_COLORS.backlog },
    priority: 3,
    priorityName: "Medium",
    project: { name: "Marketing site" },
    labels: [{ name: "Copy", color: LABEL_COLORS.copy }],
    screenshot: "list",
  },
  {
    teamKey: "DSG",
    title: "CTA buttons need more breathing room",
    description: "Padding looks cramped against the subtitle on smaller viewports.",
    status: { type: "unstarted", name: "Todo", color: STATUS_COLORS.todo },
    priority: 3,
    priorityName: "Medium",
    labels: [{ name: "Design", color: LABEL_COLORS.design }],
    screenshot: "form",
  },
  {
    teamKey: "BUG",
    title: "Background blur janky on Safari",
    description: "Backdrop-filter dropping frames during the popup transition.",
    status: { type: "started", name: "In progress", color: STATUS_COLORS.inProgress },
    priority: 1,
    priorityName: "Urgent",
    project: { name: "Browser compat" },
    labels: [
      { name: "Bug", color: LABEL_COLORS.bug },
      { name: "Performance", color: LABEL_COLORS.performance },
    ],
    screenshot: "chart",
  },
  {
    teamKey: "GRW",
    title: '"View on GitHub" should track click-throughs',
    description: "We're missing analytics on the secondary CTA.",
    status: { type: "unstarted", name: "Todo", color: STATUS_COLORS.todo },
    priority: 2,
    priorityName: "High",
    project: { name: "Q3 — Attribution" },
    labels: [{ name: "Growth", color: LABEL_COLORS.growth }],
    screenshot: "settings",
  },
  {
    teamKey: "A11Y",
    title: "Hotkey hint needs a focus state",
    description: "Tab-navigating skips right past it. Should be focusable + announced.",
    status: { type: "backlog", name: "Backlog", color: STATUS_COLORS.backlog },
    priority: 2,
    priorityName: "High",
    labels: [
      { name: "Accessibility", color: LABEL_COLORS.copy },
      { name: "Bug", color: LABEL_COLORS.bug },
    ],
    screenshot: "kanban",
  },
  {
    teamKey: "DX",
    title: "Add a code sample for the auth flow",
    description: "Devs are asking how to wire it up — let's drop a snippet in the docs.",
    status: { type: "started", name: "In review", color: STATUS_COLORS.inReview },
    priority: 3,
    priorityName: "Medium",
    project: { name: "Docs refresh" },
    labels: [{ name: "Docs", color: LABEL_COLORS.docs }],
    screenshot: "code",
  },
  {
    teamKey: "OPS",
    title: "Release notes are out of date",
    description: "Latest version on the page is two releases behind GitHub.",
    status: { type: "backlog", name: "Backlog", color: STATUS_COLORS.backlog },
    priority: 4,
    priorityName: "Low",
    labels: [{ name: "Improvement", color: LABEL_COLORS.improvement }],
    screenshot: "calendar",
  },
  {
    teamKey: "WEB",
    title: "Add a dark/light theme toggle",
    description: "We force dark mode — some users prefer light when projecting.",
    status: { type: "backlog", name: "Backlog", color: STATUS_COLORS.backlog },
    priority: 0,
    priorityName: "No priority",
    labels: [{ name: "Feature", color: LABEL_COLORS.feature }],
    screenshot: "settings",
  },
  {
    teamKey: "PER",
    title: "Animated background spikes CPU on idle",
    description: "Conic gradient + blur is hot. Pause animation when tab is hidden.",
    status: { type: "started", name: "In progress", color: STATUS_COLORS.inProgress },
    priority: 1,
    priorityName: "Urgent",
    project: { name: "Performance sweep" },
    labels: [{ name: "Performance", color: LABEL_COLORS.performance }],
    screenshot: "chart",
  },
  {
    teamKey: "MKT",
    title: "Pricing page is missing from the footer",
    description: "Once we ship the paid plan, this needs to be linked everywhere.",
    status: { type: "backlog", name: "Backlog", color: STATUS_COLORS.backlog },
    priority: 4,
    priorityName: "Low",
    labels: [
      { name: "Copy", color: LABEL_COLORS.copy },
      { name: "Growth", color: LABEL_COLORS.growth },
    ],
    screenshot: "list",
  },
];

export function pickRandomScenario(exclude?: Scenario): Scenario {
  if (SCENARIOS.length === 1) return SCENARIOS[0];
  let pick = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  while (exclude && pick === exclude) {
    pick = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  }
  return pick;
}
