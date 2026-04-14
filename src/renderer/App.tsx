import React, { useState } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { CreateIssueView } from './components/CreateIssueView';
import { ExistingTicketSearch } from './components/ExistingTicketSearch';
import { SettingsView } from './components/SettingsView';

type View = 'create' | 'existing' | 'settings';

export function App() {
  const { screenshot, loading, error } = useScreenshot();
  const [view, setView] = useState<View>('create');

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

  if (error || !screenshot) {
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
