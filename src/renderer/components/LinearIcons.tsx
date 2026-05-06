import React from 'react';

// --- Priority Icons (match Linear's bar-chart style) ---

export const PriorityIcon = React.memo(function PriorityIcon({ level, className = 'w-4 h-4' }: { readonly level: number; readonly className?: string }) {
  switch (level) {
    case 1: return <UrgentIcon className={className} />;
    case 2: return <HighIcon className={className} />;
    case 3: return <MediumIcon className={className} />;
    case 4: return <LowIcon className={className} />;
    default: return <NoPriorityIcon className={className} />;
  }
});

function UrgentIcon({ className }: { readonly className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M3 1.5h2v11H3z" fill="#f2555a" rx="1" />
      <path d="M7 4.5h2v8H7z" fill="#f2555a" rx="1" />
      <path d="M11 7.5h2v5h-2z" fill="#f2555a" rx="1" />
      <circle cx="14" cy="2" r="1.5" fill="#f2555a" />
    </svg>
  );
}

function HighIcon({ className }: { readonly className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="8" width="3" height="6" rx="0.5" fill="#f2994a" />
      <rect x="5" y="5" width="3" height="9" rx="0.5" fill="#f2994a" />
      <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#f2994a" />
    </svg>
  );
}

function MediumIcon({ className }: { readonly className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="8" width="3" height="6" rx="0.5" fill="#f2c94c" />
      <rect x="5" y="5" width="3" height="9" rx="0.5" fill="#f2c94c" />
      <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#52525b" />
    </svg>
  );
}

function LowIcon({ className }: { readonly className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="8" width="3" height="6" rx="0.5" fill="#6b9bf2" />
      <rect x="5" y="5" width="3" height="9" rx="0.5" fill="#52525b" />
      <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#52525b" />
    </svg>
  );
}

function NoPriorityIcon({ className }: { readonly className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <line x1="1" y1="8" x2="15" y2="8" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  );
}

// --- Status Icons (match Linear's circular workflow state icons) ---

export const StatusIcon = React.memo(StatusIconImpl);

function StatusIconImpl({ type, color, className = 'w-3.5 h-3.5' }: { readonly type: string; readonly color: string; readonly className?: string }) {
  switch (type) {
    case 'backlog':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" strokeDasharray="2.5 2.5" />
        </svg>
      );
    case 'unstarted':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'started':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M8 2a6 6 0 0 1 0 12" fill={color} />
        </svg>
      );
    case 'completed':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M5.5 8.5l2 2 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cancelled':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        </svg>
      );
  }
}

// --- Label dot ---

export const LabelDot = React.memo(function LabelDot({ color, className = 'w-3 h-3' }: { readonly color: string; readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  );
});
