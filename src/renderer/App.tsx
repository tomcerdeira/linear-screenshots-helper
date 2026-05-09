import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScreenshot } from './hooks/useScreenshot';
import { CreateIssueView } from './components/CreateIssueView';
import { ExistingTicketSearch } from './components/ExistingTicketSearch';
import { SettingsView } from './components/SettingsView';
import { WelcomeView } from './components/WelcomeView';
import type { ScreenshotData } from '../shared/types';

const VIEW_TRANSITION = { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const };
const VIEW_INITIAL = { opacity: 0, x: 6 };
const VIEW_ANIMATE = { opacity: 1, x: 0 };
const VIEW_EXIT = { opacity: 0, x: -6 };

function ViewWrapper({ k, children }: { readonly k: string; readonly children: React.ReactNode }) {
  return (
    <motion.div
      key={k}
      initial={VIEW_INITIAL}
      animate={VIEW_ANIMATE}
      exit={VIEW_EXIT}
      transition={VIEW_TRANSITION}
      className="h-full flex flex-col"
    >
      {children}
    </motion.div>
  );
}

type View = 'create' | 'existing' | 'settings';

const IS_STANDALONE =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('windowMode') === 'standalone';

export function App() {
  const { screenshot, loading, error } = useScreenshot();
  const [view, setView] = useState<View>('create');
  const [queuedScreenshots, setQueuedScreenshots] = useState<ScreenshotData[]>([]);
  const [isQueueMode, setIsQueueMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      window.api.getScreenshotQueue(),
      window.api.getOnboardingComplete(),
    ]).then(([queueResult, onboardingResult]) => {
      if (cancelled) return;
      if (queueResult.success && queueResult.data && queueResult.data.length > 0) {
        setQueuedScreenshots(queueResult.data);
        setIsQueueMode(true);
      }
      setShowWelcome(onboardingResult.success && onboardingResult.data === false);
    });
    return () => { cancelled = true; };
  }, []);

  function handleClose() {
    window.api.closeWindow();
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#5a5e7a]">Loading...</p>
        </div>
      </Shell>
    );
  }

  // Queue mode: multiple screenshots
  if (isQueueMode && queuedScreenshots.length > 0) {
    const primaryScreenshot = queuedScreenshots[0];
    const allDataUrls = queuedScreenshots.map((s) => s.dataUrl);

    return (
      <Shell>
        <AnimatePresence mode="wait" initial={false}>
          {view === 'create' && (
            <ViewWrapper k="create">
              <CreateIssueView
                screenshotDataUrl={primaryScreenshot.dataUrl}
                additionalScreenshots={allDataUrls.slice(1)}
                onClose={handleClose}
                onSwitchToExisting={() => setView('existing')}
              />
            </ViewWrapper>
          )}
          {view === 'existing' && (
            <ViewWrapper k="existing">
              <ExistingTicketSearch
                screenshotDataUrl={primaryScreenshot.dataUrl}
                additionalScreenshots={allDataUrls.slice(1)}
                onBack={() => setView('create')}
              />
            </ViewWrapper>
          )}
          {view === 'settings' && (
            <ViewWrapper k="settings">
              <SettingsView
                onBack={() => setView('create')}
                onClose={IS_STANDALONE ? undefined : handleClose}
                isStandalone={IS_STANDALONE}
              />
            </ViewWrapper>
          )}
        </AnimatePresence>
      </Shell>
    );
  }

  // Single screenshot mode
  if (error || !screenshot) {
    if (showWelcome) {
      return (
        <Shell>
          <WelcomeView onComplete={() => setShowWelcome(false)} />
        </Shell>
      );
    }
    return (
      <Shell>
        <SettingsView
          onClose={IS_STANDALONE ? undefined : handleClose}
          isStandalone={IS_STANDALONE}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <AnimatePresence mode="wait" initial={false}>
        {view === 'create' && (
          <ViewWrapper k="create">
            <CreateIssueView
              screenshotDataUrl={screenshot.dataUrl}
              onClose={handleClose}
              onSwitchToExisting={() => setView('existing')}
            />
          </ViewWrapper>
        )}
        {view === 'existing' && (
          <ViewWrapper k="existing">
            <ExistingTicketSearch
              screenshotDataUrl={screenshot.dataUrl}
              onBack={() => setView('create')}
            />
          </ViewWrapper>
        )}
        {view === 'settings' && (
          <ViewWrapper k="settings">
            <SettingsView
              onBack={() => setView('create')}
              onClose={IS_STANDALONE ? undefined : handleClose}
              isStandalone={IS_STANDALONE}
            />
          </ViewWrapper>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function Shell({ children }: { readonly children: React.ReactNode }) {
  function handleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target === e.currentTarget) {
      (document.activeElement as HTMLElement)?.blur();
    }
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden" onClick={handleClick}>
      {IS_STANDALONE && (
        <div
          className="h-7 shrink-0 select-none"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />
      )}
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
