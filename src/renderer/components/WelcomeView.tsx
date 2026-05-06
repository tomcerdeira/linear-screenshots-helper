import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface WelcomeViewProps {
  readonly onComplete: () => void;
}

const PAGE_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };

export function WelcomeView({ onComplete }: WelcomeViewProps) {
  const [page, setPage] = useState(0);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {page === 0 ? (
        <motion.div
          key="page0"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={PAGE_TRANSITION}
          className="flex flex-col items-center justify-center h-full px-10 gap-5"
        >
        <div className="w-16 h-16 rounded-[18px] bg-linear-brand flex items-center justify-center shadow-lg shadow-linear-brand/20">
          <svg width="36" height="36" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" d="M640 832H64V640a128 128 0 1 0 0-256V192h576v160h64V192h256v192a128 128 0 1 0 0 256v192H704V672h-64v160zm0-416v192h64V416h-64z"/>
          </svg>
        </div>
        <div className="text-center space-y-2.5">
          <h1 className="text-base font-semibold text-content tracking-tight">
            Screenshots to <span className="text-linear-brand">Linear tickets</span> in seconds
          </h1>
          <p className="text-xs text-content-ghost leading-relaxed max-w-[320px]">
            A tiny menu bar app that captures any region of your screen
            and creates Linear issues, without leaving your flow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPage(1)}
          className="px-5 py-2 bg-linear-brand text-white rounded-full text-xs font-medium hover:bg-linear-brand-hover transition-colors"
        >
          Get started
        </button>
        </motion.div>
      ) : (
        <motion.div
          key="page1"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={PAGE_TRANSITION}
          className="flex flex-col h-full px-8 py-6 gap-5"
        >
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-content">How it works</h2>
            <p className="text-[11px] text-content-ghost">Three steps. That's it.</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {[
              { num: '1', text: 'Hit the shortcut to capture a region of your screen.' },
              { num: '2', text: 'A form pops up — add a title, description, and metadata.' },
              { num: '3', text: 'Your screenshot is attached and the issue is created in Linear.' },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-baseline gap-3">
                <span className="text-[11px] font-medium text-linear-brand w-3 shrink-0">{num}</span>
                <p className="text-xs text-content-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <button
              type="button"
              onClick={async () => {
                await window.api.setOnboardingComplete(true);
                onComplete();
              }}
              className="w-full py-2 bg-linear-brand text-white rounded-full text-xs font-medium hover:bg-linear-brand-hover transition-colors"
            >
              Set up your API key
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
