import React, { useState, useEffect } from 'react';
import { ScreenshotPreview } from './ScreenshotPreview';
import { useIssueSearch } from '../hooks/useIssueSearch';
import { useRecentIssues } from '../hooks/useRecentIssues';
import { useRecentSelections } from '../hooks/useRecentSelections';
import { INPUT_CLASS, TEXTAREA_CLASS, BTN_PRIMARY_CLASS, BACK_LINK_CLASS } from '../utils/styles';
import type { LinearIssueResult } from '../../shared/types';

interface ExistingTicketSearchProps {
  readonly screenshotDataUrl: string;
  readonly onBack: () => void;
  readonly preselectedIssue?: LinearIssueResult | null;
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

export function ExistingTicketSearch({ screenshotDataUrl, onBack, preselectedIssue }: ExistingTicketSearchProps) {
  const [query, setQuery] = useState('');
  const [comment, setComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<LinearIssueResult | null>(preselectedIssue ?? null);

  const { results, loading: searching } = useIssueSearch(query);
  const { issues: assignedIssues, loading: loadingAssigned } = useRecentIssues();
  const { recentTickets } = useRecentSelections();

  const showSearchResults = query.length >= 2;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onBack();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack, selectedIssue]);

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
                {results.length > 0 && <IssueList issues={results} onSelect={setSelectedIssue} />}
                {!searching && results.length === 0 && <p className="text-xs text-content-ghost">No issues found</p>}
              </>
            ) : (
              <>
                {recentTickets.length > 0 && (
                  <div>
                    <p className="text-xs text-content-ghost mb-1.5">Recently used</p>
                    <IssueList issues={recentTickets} onSelect={setSelectedIssue} />
                  </div>
                )}
                {!loadingAssigned && assignedIssues.length > 0 && (
                  <div>
                    <p className="text-xs text-content-ghost mb-1.5">Assigned to you</p>
                    <IssueList issues={assignedIssues} onSelect={setSelectedIssue} />
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
                onClick={() => setSelectedIssue(null)}
                className="text-content-ghost hover:text-content text-xs ml-2 shrink-0 transition-colors"
              >
                Change
              </button>
            </div>

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
            Attach screenshot
          </button>
        </div>
      )}
    </div>
  );
}
