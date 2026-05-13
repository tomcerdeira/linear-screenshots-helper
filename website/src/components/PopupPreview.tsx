"use client";

import Image from "next/image";
import { m } from "framer-motion";

const COLORS = {
  surface: "#1f2023",
  surfaceRaised: "#232326",
  surfaceInput: "#2a2a2e",
  border: "#333338",
  borderSubtle: "#3b3b40",
  content: "#e2e2ea",
  contentSecondary: "#9b9ba4",
  contentMuted: "#6f6f78",
  contentGhost: "#5a5e7a",
  contentPlaceholder: "#4a4a55",
  brand: "#5e6ad2",
  brandHover: "#6c78e0",
} as const;

export type Scenario = {
  readonly teamKey: string;
  readonly title: string;
  readonly description?: string;
  readonly status: { readonly type: StatusType; readonly name: string; readonly color: string };
  readonly priority: PriorityLevel;
  readonly priorityName: string;
  readonly project?: { readonly name: string };
  readonly labels: ReadonlyArray<{ readonly name: string; readonly color: string }>;
  readonly screenshot: ScreenshotMock;
};

export type StatusType = "backlog" | "unstarted" | "started" | "completed" | "cancelled";
export type PriorityLevel = 0 | 1 | 2 | 3 | 4;
export type ScreenshotMock = "list" | "chart" | "form" | "kanban" | "calendar" | "code" | "settings";

function Pill({
  children,
  shortcut,
  active,
}: {
  children: React.ReactNode;
  shortcut?: string;
  active?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border whitespace-nowrap shrink-0"
      style={{
        background: active ? COLORS.surfaceInput : "transparent",
        borderColor: COLORS.border,
        color: COLORS.contentSecondary,
      }}
    >
      {children}
      {shortcut && (
        <kbd
          className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded text-[9px] font-medium leading-none uppercase border"
          style={{
            background: COLORS.surfaceInput,
            borderColor: COLORS.borderSubtle,
            color: COLORS.contentMuted,
          }}
        >
          {shortcut}
        </kbd>
      )}
    </span>
  );
}

function StatusIcon({ type, color }: { type: StatusType; color: string }) {
  switch (type) {
    case "backlog":
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" strokeDasharray="2.5 2.5" />
        </svg>
      );
    case "unstarted":
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "started":
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M8 2a6 6 0 0 1 0 12" fill={color} />
        </svg>
      );
    case "completed":
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M5.5 8.5l2 2 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "cancelled":
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

function PriorityIcon({ level }: { level: PriorityLevel }) {
  switch (level) {
    case 1:
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <rect x="3" y="1.5" width="2" height="11" rx="1" fill="#f2555a" />
          <rect x="7" y="4.5" width="2" height="8" rx="1" fill="#f2555a" />
          <rect x="11" y="7.5" width="2" height="5" rx="1" fill="#f2555a" />
          <circle cx="14" cy="2" r="1.5" fill="#f2555a" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <rect x="1" y="8" width="3" height="6" rx="0.5" fill="#f2994a" />
          <rect x="5" y="5" width="3" height="9" rx="0.5" fill="#f2994a" />
          <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#f2994a" />
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <rect x="1" y="8" width="3" height="6" rx="0.5" fill="#f2c94c" />
          <rect x="5" y="5" width="3" height="9" rx="0.5" fill="#f2c94c" />
          <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#52525b" />
        </svg>
      );
    case 4:
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <rect x="1" y="8" width="3" height="6" rx="0.5" fill="#6b9bf2" />
          <rect x="5" y="5" width="3" height="9" rx="0.5" fill="#52525b" />
          <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#52525b" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
          <line x1="1" y1="8" x2="15" y2="8" stroke="#6f6f78" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
        </svg>
      );
  }
}

function LabelDot({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );
}

const CHART_BARS = [
  { id: "mon", height: 40 },
  { id: "tue", height: 65 },
  { id: "wed", height: 50 },
  { id: "thu", height: 75 },
  { id: "fri", height: 55 },
  { id: "sat", height: 85, highlight: true },
  { id: "sun", height: 70 },
] as const;

const KANBAN_COLUMNS = [
  { id: "todo", cards: ["t1", "t2", "t3"] },
  { id: "doing", cards: ["d1", "d2"] },
  { id: "done", cards: ["x1", "x2", "x3", "x4"] },
] as const;

const CALENDAR_DAYS = Array.from({ length: 28 }, (_, i) => ({
  id: `day-${i}`,
  highlight: i === 11 || i === 12 || i === 18,
}));

function ScreenshotContent({ kind }: { kind: ScreenshotMock }) {
  switch (kind) {
    case "list":
      return (
        <>
          <div>
            <div className="text-[10px] font-semibold" style={{ color: COLORS.content }}>Needs attention</div>
            <div className="text-[8px]" style={{ color: COLORS.contentMuted }}>
              Top buckets the team should be looking at, by priority.
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="rounded-md h-[14px] w-full" style={{ background: COLORS.surfaceInput }} />
            <div className="rounded-md h-[14px] w-full" style={{ background: COLORS.surfaceInput }} />
            <div className="rounded-md h-[14px] w-[80%]" style={{ background: COLORS.surfaceInput }} />
            <div className="rounded-md h-[14px] w-full" style={{ background: COLORS.surfaceInput }} />
          </div>
        </>
      );
    case "chart":
      return (
        <>
          <div>
            <div className="text-[10px] font-semibold" style={{ color: COLORS.content }}>Conversion this week</div>
            <div className="text-[8px]" style={{ color: COLORS.contentMuted }}>+12.4% vs. last week</div>
          </div>
          <div className="flex-1 flex items-end gap-1.5 px-1">
            {CHART_BARS.map((bar) => (
              <div
                key={bar.id}
                className="flex-1 rounded-sm"
                style={{
                  height: `${bar.height}%`,
                  background: "highlight" in bar && bar.highlight ? COLORS.brand : COLORS.surfaceInput,
                }}
              />
            ))}
          </div>
        </>
      );
    case "form":
      return (
        <>
          <div>
            <div className="text-[10px] font-semibold" style={{ color: COLORS.content }}>Account settings</div>
            <div className="text-[8px]" style={{ color: COLORS.contentMuted }}>Update your billing details</div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col gap-1">
              <div className="h-[6px] w-[40px] rounded" style={{ background: COLORS.contentMuted, opacity: 0.4 }} />
              <div className="h-[18px] w-full rounded border" style={{ background: COLORS.surfaceInput, borderColor: COLORS.borderSubtle }} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-[6px] w-[60px] rounded" style={{ background: COLORS.contentMuted, opacity: 0.4 }} />
              <div className="h-[18px] w-full rounded border" style={{ background: COLORS.surfaceInput, borderColor: COLORS.borderSubtle }} />
            </div>
          </div>
        </>
      );
    case "kanban":
      return (
        <>
          <div className="text-[10px] font-semibold" style={{ color: COLORS.content }}>Sprint 24</div>
          <div className="grid grid-cols-3 gap-2 flex-1">
            {KANBAN_COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col gap-1">
                <div className="h-[6px] w-[60%] rounded" style={{ background: COLORS.contentMuted, opacity: 0.4 }} />
                {column.cards.map((cardId) => (
                  <div key={cardId} className="rounded p-1.5" style={{ background: COLORS.surfaceInput }}>
                    <div className="h-[4px] w-full rounded mb-1" style={{ background: COLORS.contentMuted, opacity: 0.5 }} />
                    <div className="h-[4px] w-[70%] rounded" style={{ background: COLORS.contentMuted, opacity: 0.3 }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      );
    case "calendar":
      return (
        <>
          <div className="text-[10px] font-semibold" style={{ color: COLORS.content }}>March 2026</div>
          <div className="grid grid-cols-7 gap-[3px] flex-1">
            {CALENDAR_DAYS.map((day) => (
              <div
                key={day.id}
                className="rounded-sm"
                style={{
                  background: day.highlight ? COLORS.brand : COLORS.surfaceInput,
                  opacity: day.highlight ? 0.8 : 1,
                }}
              />
            ))}
          </div>
        </>
      );
    case "code":
      return (
        <>
          <div className="text-[8px] font-mono" style={{ color: COLORS.contentMuted }}>auth.ts</div>
          <div className="flex flex-col gap-1 flex-1 font-mono text-[8px]" style={{ fontFamily: "var(--font-mono)" }}>
            <div className="flex gap-2"><span style={{ color: COLORS.contentGhost }}>1</span><span style={{ color: "#f2994a" }}>const</span> <span style={{ color: "#6b9bf2" }}>token</span> <span style={{ color: COLORS.contentMuted }}>=</span> <span style={{ color: "#7cd5b3" }}>&apos;...&apos;</span></div>
            <div className="flex gap-2"><span style={{ color: COLORS.contentGhost }}>2</span><span style={{ color: "#f2994a" }}>if</span> <span style={{ color: COLORS.contentMuted }}>(!</span><span style={{ color: "#6b9bf2" }}>token</span><span style={{ color: COLORS.contentMuted }}>)</span> <span style={{ color: COLORS.contentMuted }}>{`{`}</span></div>
            <div className="flex gap-2"><span style={{ color: COLORS.contentGhost }}>3</span><span className="ml-3" style={{ color: "#f2555a" }}>throw</span> <span style={{ color: "#f2994a" }}>new</span> <span style={{ color: "#6b9bf2" }}>Error</span><span style={{ color: COLORS.contentMuted }}>(</span><span style={{ color: "#7cd5b3" }}>&apos;Missing token&apos;</span><span style={{ color: COLORS.contentMuted }}>)</span></div>
            <div className="flex gap-2"><span style={{ color: COLORS.contentGhost }}>4</span><span style={{ color: COLORS.contentMuted }}>{`}`}</span></div>
            <div className="flex gap-2"><span style={{ color: COLORS.contentGhost }}>5</span><span style={{ color: COLORS.contentGhost, fontStyle: "italic" }}>{"// returns 401"}</span></div>
          </div>
        </>
      );
    case "settings":
      return (
        <>
          <div className="text-[10px] font-semibold" style={{ color: COLORS.content }}>Notifications</div>
          <div className="flex flex-col gap-2 flex-1">
            {["Email digest", "Push notifications", "Weekly summary"].map((label, i) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[9px]" style={{ color: COLORS.contentSecondary }}>{label}</span>
                <div className="w-[22px] h-[12px] rounded-full p-[2px]" style={{ background: i === 0 ? COLORS.brand : COLORS.surfaceInput }}>
                  <div className="size-[8px] rounded-full bg-white" style={{ marginLeft: i === 0 ? "10px" : "0" }} />
                </div>
              </div>
            ))}
          </div>
        </>
      );
  }
}

export function PopupPreview({
  scenario,
  capturedImage,
  onCreateIssue,
  onClose,
}: {
  scenario: Scenario;
  capturedImage?: string | null;
  onCreateIssue?: () => void;
  onClose?: () => void;
}) {
  const teamLetter = scenario.teamKey[0].toUpperCase();

  return (
    <div
      className="relative w-[640px] max-w-[92vw] aspect-[16/10] select-none"
      style={{
        filter:
          "drop-shadow(0 30px 80px rgba(94, 106, 210, 0.25)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.6))",
      }}
    >
      {/* Soft purple glow behind */}
      <div className="absolute inset-0 -z-10 rounded-[18px] bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.18_277/0.35),transparent_70%)] blur-2xl scale-110" />

      <div
        className="relative h-full w-full rounded-[14px] border overflow-hidden flex flex-col"
        style={{
          background: COLORS.surface,
          borderColor: COLORS.border,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="inline-flex items-center justify-center size-[18px] rounded text-[10px] font-bold"
              style={{
                background: "linear-gradient(135deg, #6c78e0, #5e6ad2)",
                color: "white",
              }}
            >
              {teamLetter}
            </span>
            <span className="text-[12px] font-medium" style={{ color: COLORS.content }}>{scenario.teamKey}</span>
            <span className="text-[12px]" style={{ color: COLORS.contentGhost }}>›</span>
            <span className="text-[12px] font-medium" style={{ color: COLORS.content }}>New issue</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="px-2 py-1 text-[10px] rounded transition-colors flex items-center gap-1"
              style={{ color: COLORS.contentGhost }}
            >
              Attach to existing
              <kbd
                className="inline-flex items-center justify-center min-w-[12px] h-[12px] px-0.5 rounded text-[8px] font-medium leading-none uppercase border"
                style={{
                  background: COLORS.surfaceInput,
                  borderColor: COLORS.borderSubtle,
                  color: COLORS.contentMuted,
                }}
              >
                E
              </kbd>
            </button>
            <m.button
              type="button"
              onClick={onClose}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="p-1 rounded"
              style={{ color: COLORS.contentGhost }}
              aria-label="Close"
            >
              <CloseIcon />
            </m.button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col px-5 py-2 min-h-0">
          <div className="text-[15px] font-semibold leading-tight mb-1" style={{ color: COLORS.content }}>
            {scenario.title}
          </div>
          <div
            className="text-[12px] mb-3"
            style={{
              color: scenario.description ? COLORS.contentSecondary : COLORS.contentPlaceholder,
            }}
          >
            {scenario.description ?? "Add description..."}
          </div>

          <div
            className="relative flex-1 rounded-md border overflow-hidden flex flex-col gap-2"
            style={{
              background: "#181a1d",
              borderColor: COLORS.borderSubtle,
              minHeight: 0,
            }}
          >
            {capturedImage ? (
              <Image
                src={capturedImage}
                alt="Captured region"
                fill
                unoptimized
                className="object-contain"
                sizes="640px"
              />
            ) : (
              <div className="flex flex-col gap-2 p-3 flex-1">
                <ScreenshotContent kind={scenario.screenshot} />
              </div>
            )}
          </div>

          <button
            type="button"
            className="self-start mt-2 inline-flex items-center gap-1.5 text-[10px]"
            style={{ color: COLORS.contentGhost }}
          >
            <CloseIcon />
            <span>Hide screenshot</span>
          </button>
        </div>

        {/* Metadata pills row */}
        <div className="px-4 py-2 flex items-center gap-1.5 shrink-0 flex-nowrap overflow-hidden">
          <Pill shortcut="S">
            <StatusIcon type={scenario.status.type} color={scenario.status.color} />
            <span style={{ color: COLORS.content }}>{scenario.status.name}</span>
          </Pill>
          <Pill shortcut="P">
            <PriorityIcon level={scenario.priority} />
            <span style={{ color: scenario.priority === 0 ? COLORS.contentSecondary : COLORS.content }}>
              {scenario.priorityName}
            </span>
          </Pill>
          <Pill shortcut="A">
            <Image
              src="/86ca898605bdbcbe47f5a8e04a088baf3d91d072eaae8aa36bd224993f0862f8.webp"
              alt="Karri Saarinen"
              width={14}
              height={14}
              className="size-3.5 rounded-full object-cover"
            />
            <span style={{ color: COLORS.content }}>Karri Saarinen</span>
          </Pill>
          {scenario.project && (
            <Pill>
              <ProjectIcon />
              <span style={{ color: COLORS.content }}>{scenario.project.name}</span>
            </Pill>
          )}
          {scenario.labels.length > 0 ? (
            <Pill shortcut="L">
              {scenario.labels.length === 1 ? (
                <>
                  <LabelDot color={scenario.labels[0].color} />
                  <span style={{ color: COLORS.content }}>{scenario.labels[0].name}</span>
                </>
              ) : (
                <>
                  <span className="inline-flex -space-x-1">
                    {scenario.labels.slice(0, 3).map((label) => (
                      <span key={label.name} className="inline-block">
                        <LabelDot color={label.color} />
                      </span>
                    ))}
                  </span>
                  <span style={{ color: COLORS.content }}>{scenario.labels.length} labels</span>
                </>
              )}
            </Pill>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2.5 flex items-center justify-between shrink-0">
          <button type="button" className="p-1.5 rounded" style={{ color: COLORS.contentGhost }}>
            <PaperclipIcon />
          </button>
          <m.button
            type="button"
            onClick={onCreateIssue}
            whileHover={{
              scale: 1.04,
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.1) inset, 0 6px 20px rgba(94,106,210,0.55)",
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative px-3.5 py-1.5 rounded-full text-[11px] font-medium text-white overflow-hidden"
            style={{
              background: COLORS.brand,
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06) inset, 0 4px 14px rgba(94,106,210,0.4)",
            }}
          >
            <span className="relative z-10">Create issue</span>
            <m.span
              aria-hidden
              className="absolute inset-0 -translate-x-full"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
              }}
              whileHover={{ x: ["-100%", "100%"] }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          </m.button>
        </div>
      </div>
    </div>
  );
}
