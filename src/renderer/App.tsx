import React, { useState } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { ActionPicker } from './components/ActionPicker';
import { NewTicketForm } from './components/NewTicketForm';
import { ExistingTicketSearch } from './components/ExistingTicketSearch';
import { SettingsView } from './components/SettingsView';
import type { LinearIssueResult } from '../shared/types';

type View = 'action' | 'new' | 'existing' | 'settings' | 'success';

export function App() {
  const { screenshot, loading, error } = useScreenshot();
  const [view, setView] = useState<View>('action');
  const [successIssue, setSuccessIssue] = useState<LinearIssueResult | null>(null);
  const [preselectedIssue, setPreselectedIssue] = useState<LinearIssueResult | null>(null);

  function handleSuccess(issue: LinearIssueResult) {
    setSuccessIssue(issue);
    setView('success');
  }

  function handleDiscard() {
    window.api.closeWindow();
  }

  function handleQuickAttach(issue: LinearIssueResult) {
    setPreselectedIssue(issue);
    setView('existing');
  }

  function handleBackToAction() {
    setPreselectedIssue(null);
    setView('action');
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#6b6f8e]">Loading...</p>
        </div>
      </Shell>
    );
  }

  if (error || !screenshot) {
    return (
      <Shell>
        <SettingsView onClose={handleDiscard} />
      </Shell>
    );
  }

  return (
    <Shell>
      {view === 'action' && (
        <ActionPicker
          screenshotDataUrl={screenshot.dataUrl}
          onSelect={(action) => setView(action)}
          onDiscard={handleDiscard}
          onQuickAttach={handleQuickAttach}
        />
      )}

      {view === 'new' && (
        <NewTicketForm
          screenshotDataUrl={screenshot.dataUrl}
          onBack={handleBackToAction}
          onSuccess={handleSuccess}
        />
      )}

      {view === 'existing' && (
        <ExistingTicketSearch
          screenshotDataUrl={screenshot.dataUrl}
          onBack={handleBackToAction}
          onSuccess={handleSuccess}
          preselectedIssue={preselectedIssue}
        />
      )}

      {view === 'settings' && (
        <SettingsView onBack={handleBackToAction} onClose={handleDiscard} />
      )}

      {view === 'success' && successIssue && (
        <SuccessView issue={successIssue} onClose={handleDiscard} />
      )}
    </Shell>
  );
}

function Shell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-[#191a23] rounded-xl overflow-hidden">
      <div className="drag-handle h-7 flex items-center justify-center bg-[#15161e] border-b border-[#282840] shrink-0">
        <span className="text-[11px] font-medium text-[#4a4d64]">Linear Screenshot</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
}

interface SuccessViewProps {
  readonly issue: LinearIssueResult;
  readonly onClose: () => void;
}

function SuccessView({ issue, onClose }: SuccessViewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-12 h-12 rounded-full bg-[#30a46c]/15 flex items-center justify-center">
        <svg className="w-6 h-6 text-[#30a46c]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#d2d3e0]">Screenshot added!</p>
      <p className="text-xs text-[#5e6ad2] font-mono">{issue.identifier}</p>
      <p className="text-xs text-[#8b8ea4]">{issue.title}</p>
      <button
        onClick={onClose}
        className="mt-2 px-4 py-1.5 text-sm text-[#6b6f8e] hover:text-[#d2d3e0] transition-colors"
      >
        Close
      </button>
    </div>
  );
}
