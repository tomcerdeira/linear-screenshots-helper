import React, { useState, useEffect } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { CreateIssueView } from './components/CreateIssueView';
import { ExistingTicketSearch } from './components/ExistingTicketSearch';
import { SettingsView } from './components/SettingsView';
import { WelcomeView } from './components/WelcomeView';
import type { ScreenshotData } from '../shared/types';

type View = 'create' | 'existing' | 'settings';

export function App() {
  const { screenshot, loading, error } = useScreenshot();
  const [view, setView] = useState<View>('create');
  const [queuedScreenshots, setQueuedScreenshots] = useState<ScreenshotData[]>([]);
  const [isQueueMode, setIsQueueMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkQueue() {
      const result = await window.api.getScreenshotQueue();
      if (result.success && result.data && result.data.length > 0) {
        setQueuedScreenshots(result.data);
        setIsQueueMode(true);
      }
    }
    checkQueue();
  }, []);

  useEffect(() => {
    async function checkOnboarding() {
      const result = await window.api.getOnboardingComplete();
      setShowWelcome(result.success && result.data === false);
    }
    checkOnboarding();
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
        {view === 'create' && (
          <CreateIssueView
            screenshotDataUrl={primaryScreenshot.dataUrl}
            additionalScreenshots={allDataUrls.slice(1)}
            onClose={handleClose}
            onSwitchToExisting={() => setView('existing')}
          />
        )}

        {view === 'existing' && (
          <ExistingTicketSearch
            screenshotDataUrl={primaryScreenshot.dataUrl}
            onBack={() => setView('create')}
          />
        )}

        {view === 'settings' && (
          <SettingsView onBack={() => setView('create')} onClose={handleClose} />
        )}
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
        <SettingsView onClose={handleClose} />
      </Shell>
    );
  }

  return (
    <Shell>
      {view === 'create' && (
        <CreateIssueView
          screenshotDataUrl={screenshot.dataUrl}
          onClose={handleClose}
          onSwitchToExisting={() => setView('existing')}
        />
      )}

      {view === 'existing' && (
        <ExistingTicketSearch
          screenshotDataUrl={screenshot.dataUrl}
          onBack={() => setView('create')}
        />
      )}

      {view === 'settings' && (
        <SettingsView onBack={() => setView('create')} onClose={handleClose} />
      )}
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
      {children}
    </div>
  );
}
