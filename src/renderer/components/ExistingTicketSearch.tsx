import React, { useState, useEffect } from 'react';
import { GitBranch, Paperclip, X } from 'lucide-react';
import { ScreenshotPreview } from './ScreenshotPreview';
import { CreateIssueView } from './CreateIssueView';
import { useIssueSearch } from '../hooks/useIssueSearch';
import { useRecentIssues } from '../hooks/useRecentIssues';
import { useRecentSelections } from '../hooks/useRecentSelections';
import { INPUT_CLASS, TEXTAREA_CLASS, BTN_PRIMARY_CLASS, BACK_LINK_CLASS } from '../utils/styles';
import type { LinearIssueResult } from '../../shared/types';

type AttachMode = 'comment' | 'subIssue';

interface ExistingTicketSearchProps {
  readonly screenshotDataUrl: string;
  readonly additionalScreenshots?: string[];
  readonly onBack: () => void;
  readonly preselectedIssue?: LinearIssueResult | null;
  readonly draftTitle?: string;
  readonly draftDescription?: string;
  readonly draftDescriptionHTML?: string;
  readonly onDraftChange?: (draft: { title: string; description: string; descriptionHTML: string }) => void;
}

const IssueList = React.memo(function IssueList({
  issues,
  onSelect,
}: {
  readonly issues: readonly LinearIssueResult[];
  readonly onSelect: (issue: LinearIssueResult) => void;
}) {
  return (
    <ul className="border border-border rounded-md">
      {issues.map((issue, i) => (
        <li key={issue.id} className={i > 0 ? 'border-t border-surface-input' : ''}>
          <button
            type="button"
            onClick={() => onSelect(issue)}
            title={issue.title}
            className="w-full text-left px-3 py-2 hover:bg-surface-input transition-colors"
          >
            <span className="text-xs font-mono text-linear-brand">{issue.identifier}</span>
            <span className="text-sm text-content-secondary ml-2">{issue.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
});

function prefetchTeamData(teamId: string): Promise<unknown> {
  return Promise.all([
    window.api.getWorkflowStates(teamId),
    window.api.getLabels(teamId),
    window.api.getMembers(teamId),
  ]);
}

function IssueListSkeleton({ rows = 3 }: { readonly rows?: number }) {
  return (
    <ul className="border border-border rounded-md">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className={i > 0 ? 'border-t border-surface-input' : ''}>
          <div className="px-3 py-2.5 flex items-center gap-2">
            <span className="skeleton-pill inline-block w-12 h-3 rounded" />
            <span className="skeleton-pill inline-block flex-1 h-3 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ExistingTicketSearch({
  screenshotDataUrl,
  additionalScreenshots,
  onBack,
  preselectedIssue,
  draftTitle,
  draftDescription,
  draftDescriptionHTML,
  onDraftChange,
}: ExistingTicketSearchProps) {
  const [query, setQuery] = useState('');
  const [comment, setComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<LinearIssueResult | null>(preselectedIssue ?? null);
  const [mode, setMode] = useState<AttachMode>('subIssue');
  const [parentTeamId, setParentTeamId] = useState<string | null>(null);
  const [parentTeamError, setParentTeamError] = useState<string | null>(null);

  const { results, loading: searching } = useIssueSearch(query);
  const { issues: assignedIssues, loading: loadingAssigned } = useRecentIssues();
  const { recentTickets } = useRecentSelections();

  const showSearchResults = query.length >= 2;

  // Prefetch parent team as soon as an issue is selected so switching to
  // sub-issue is instant. Also warms up the team-data caches (states/labels/members).
  useEffect(() => {
    if (!selectedIssue) return;
    if (selectedIssue.teamId) {
      setParentTeamId(selectedIssue.teamId);
      void prefetchTeamData(selectedIssue.teamId);
      return;
    }
    let cancelled = false;
    setParentTeamId(null);
    setParentTeamError(null);
    window.api.getIssueTeamId(selectedIssue.id).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setParentTeamId(res.data);
        void prefetchTeamData(res.data);
      } else {
        setParentTeamError(res.error ?? 'Could not load issue team');
      }
    });
    return () => { cancelled = true; };
  }, [selectedIssue]);

  useEffect(() => {
    if (mode === 'subIssue') return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onBack();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack, selectedIssue, mode]);

  function handleSelectIssue(issue: LinearIssueResult) {
    setSelectedIssue(issue);
    setMode('subIssue');
    setParentTeamId(null);
    setParentTeamError(null);
  }

  function handleChangeIssue() {
    setSelectedIssue(null);
    setMode('subIssue');
    setParentTeamId(null);
    setParentTeamError(null);
  }

  function handleSubmit() {
    if (!selectedIssue) return;

    window.api.saveRecentTicket(selectedIssue);
    window.api.addCommentBg({
      issueId: selectedIssue.id,
      comment: comment.trim(),
      screenshotDataUrl,
      issueIdentifier: selectedIssue.identifier,
      issueTitle: selectedIssue.title,
      issueUrl: selectedIssue.url,
    });
    window.api.closeWindow();
  }

  if (selectedIssue && mode === 'subIssue') {
    if (parentTeamError) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 drag-handle">
            <div className="no-drag flex items-center gap-2 flex-1">
              <button type="button" onClick={() => setMode('comment')} className={`${BACK_LINK_CLASS} text-[13px]`}>
                &larr; Back
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-5">
            <p className="text-sm text-feedback-error">{parentTeamError}</p>
          </div>
        </div>
      );
    }

    if (!parentTeamId) {
      return <SubIssueSkeleton parentIssue={selectedIssue} onBack={() => setMode('comment')} />;
    }

    return (
      <CreateIssueView
        screenshotDataUrl={screenshotDataUrl}
        additionalScreenshots={additionalScreenshots}
        onClose={() => window.api.closeWindow()}
        onSwitchToExisting={() => setMode('comment')}
        parentIssue={selectedIssue}
        forcedTeamId={parentTeamId}
        initialTitle={draftTitle}
        initialDescription={draftDescription}
        initialDescriptionHTML={draftDescriptionHTML}
        onDraftChange={onDraftChange}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 drag-handle">
        <div className="no-drag flex items-center gap-2 flex-1">
          <button type="button" onClick={onBack} className={`${BACK_LINK_CLASS} text-[13px]`}>
            &larr; Back
          </button>
          <span className="text-[13px] text-content font-medium">Attach to existing issue</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-3 gap-3">
        {!selectedIssue ? (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or identifier..."
              className={INPUT_CLASS}
              autoFocus
            />

            {showSearchResults ? (
              <>
                {searching && <p className="text-xs text-content-ghost">Searching...</p>}
                {results.length > 0 && <IssueList issues={results} onSelect={handleSelectIssue} />}
                {!searching && results.length === 0 && <p className="text-xs text-content-ghost">No issues found</p>}
              </>
            ) : (
              <>
                {recentTickets.length > 0 && (
                  <div>
                    <p className="text-xs text-content-ghost mb-1.5">Recently used</p>
                    <IssueList issues={recentTickets} onSelect={handleSelectIssue} />
                  </div>
                )}
                {!loadingAssigned && assignedIssues.length > 0 && (
                  <div>
                    <p className="text-xs text-content-ghost mb-1.5">Assigned to you</p>
                    <IssueList issues={assignedIssues} onSelect={handleSelectIssue} />
                  </div>
                )}
                {loadingAssigned && recentTickets.length === 0 && (
                  <div>
                    <p className="text-xs text-content-ghost mb-1.5">Assigned to you</p>
                    <IssueListSkeleton rows={4} />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="bg-linear-brand/10 border border-linear-brand/25 rounded-md px-3 py-2 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono text-linear-brand">{selectedIssue.identifier}</span>
                <span className="text-sm text-content ml-2">{selectedIssue.title}</span>
              </div>
              <button
                type="button"
                onClick={handleChangeIssue}
                className="text-content-ghost hover:text-content text-xs ml-2 shrink-0 transition-colors"
              >
                Change
              </button>
            </div>

            <ModeToggle mode={mode} onChange={setMode} />

            <ScreenshotPreview dataUrl={screenshotDataUrl} />

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </>
        )}
      </div>

      {selectedIssue && (
        <div className="px-4 py-2.5 flex items-center justify-end shrink-0">
          <button type="button" onClick={handleSubmit} className={BTN_PRIMARY_CLASS}>
            Attach as comment
          </button>
        </div>
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  readonly mode: AttachMode;
  readonly onChange: (mode: AttachMode) => void;
}) {
  return (
    <div className="inline-flex self-start rounded-md bg-surface-input border border-border p-0.5 text-[12px]">
      <ModeToggleButton active={mode === 'comment'} onClick={() => onChange('comment')}>
        Comment
      </ModeToggleButton>
      <ModeToggleButton active={mode === 'subIssue'} onClick={() => onChange('subIssue')}>
        Sub-issue
      </ModeToggleButton>
    </div>
  );
}

function SubIssueSkeleton({
  parentIssue,
  onBack,
}: {
  readonly parentIssue: LinearIssueResult;
  readonly onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 drag-handle">
        <div className="no-drag flex items-center gap-2 flex-1 min-w-0">
          <GitBranch className="w-3.5 h-3.5 text-content-ghost shrink-0" />
          <span className="text-[13px] text-content font-medium shrink-0">New sub-issue of</span>
          <span className="text-xs font-mono text-linear-brand shrink-0">{parentIssue.identifier}</span>
          <span className="text-[13px] text-content-secondary truncate">{parentIssue.title}</span>
        </div>
        <div className="no-drag flex items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            className="p-1 text-content-ghost hover:text-content hover:bg-surface-input rounded transition-colors"
            aria-label="Back"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-3">
        <div className="skeleton-pill h-[26px] w-3/5 rounded mb-3" />
        <div className="skeleton-pill h-[14px] w-11/12 rounded mb-2" />
        <div className="skeleton-pill h-[14px] w-4/5 rounded mb-2" />
        <div className="skeleton-pill h-[14px] w-2/3 rounded mb-4" />
      </div>

      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
        <span className="skeleton-pill inline-block w-[72px] h-[26px] rounded-full" />
        <span className="skeleton-pill inline-block w-[72px] h-[26px] rounded-full" />
        <span className="skeleton-pill inline-block w-[72px] h-[26px] rounded-full" />
        <span className="skeleton-pill inline-block w-[72px] h-[26px] rounded-full" />
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="p-1.5 text-content-ghost">
          <Paperclip className="w-4 h-4" />
        </div>
        <span className="skeleton-pill inline-block w-[120px] h-[30px] rounded-full" />
      </div>
    </div>
  );
}

function ModeToggleButton({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded transition-colors ${
        active
          ? 'bg-surface-raised text-content shadow-sm'
          : 'text-content-ghost hover:text-content'
      }`}
    >
      {children}
    </button>
  );
}
