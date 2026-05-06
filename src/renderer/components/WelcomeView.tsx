import React, { useState } from 'react';
import { Camera, FileText, Zap, ArrowRight, Keyboard } from 'lucide-react';

interface WelcomeViewProps {
  readonly onComplete: () => void;
}

const STEPS = [
  {
    icon: Camera,
    title: 'Capture',
    description: 'Take a screenshot of anything on your screen with a quick keyboard shortcut.',
  },
  {
    icon: FileText,
    title: 'Create',
    description: 'A Linear issue form pops up instantly — add a title, description, and metadata.',
  },
  {
    icon: Zap,
    title: 'Done',
    description: 'Your screenshot is attached and the issue is created in Linear. That\'s it.',
  },
];

export function WelcomeView({ onComplete }: WelcomeViewProps) {
  const [page, setPage] = useState(0);

  if (page === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 py-6 gap-6">
        <div className="w-14 h-14 rounded-2xl bg-linear-brand/15 flex items-center justify-center">
          <Camera className="w-7 h-7 text-linear-brand" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-lg font-semibold text-content">Welcome to Linear Screenshot</h1>
          <p className="text-sm text-content-ghost leading-relaxed max-w-[380px]">
            Capture screenshots and turn them into Linear issues — right from your menu bar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPage(1)}
          className="flex items-center gap-2 px-5 py-2 bg-linear-brand text-white rounded-full text-sm font-medium hover:bg-linear-brand-hover transition-colors"
        >
          See how it works
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (page === 1) {
    return (
      <div className="flex flex-col h-full px-8 py-6 gap-5">
        <h2 className="text-sm font-semibold text-content">How it works</h2>

        <div className="flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-input border border-border shrink-0 mt-0.5">
                <step.icon className="w-4 h-4 text-linear-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-content font-medium">
                  <span className="text-content-ghost mr-1.5">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="text-xs text-content-ghost leading-relaxed mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-input border border-border">
            <Keyboard className="w-3.5 h-3.5 text-content-muted shrink-0" />
            <p className="text-[11px] text-content-ghost">
              Default shortcut: <span className="text-content font-medium">Cmd+Shift+L</span>
              <span className="text-content-ghost"> — customizable in settings</span>
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await window.api.setOnboardingComplete(true);
              onComplete();
            }}
            className="w-full py-2 bg-linear-brand text-white rounded-full text-sm font-medium hover:bg-linear-brand-hover transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    );
  }

  return null;
}
