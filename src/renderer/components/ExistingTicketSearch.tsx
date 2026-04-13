import React, { useState } from 'react';
import { ScreenshotPreview } from './ScreenshotPreview';
import { useIssueSearch } from '../hooks/useIssueSearch';
import { useRecentIssues } from '../hooks/useRecentIssues';
import { useRecentSelections } from '../hooks/useRecentSelections';
import type { LinearIssueResult } from '../../shared/types';

interface ExistingTicketSearchProps {
  readonly screenshotDataUrl: string;
  readonly onBack: () => void;
  readonly onSuccess: (issue: LinearIssueResult) => void;
  readonly preselectedIssue?: LinearIssueResult | null;
}

function IssueList({
  issues,
  onSelect,
}: {
  readonly issues: readonly LinearIssueResult[];
  readonly onSelect: (issue: LinearIssueResult) => void;
}) {
  return (
    <ul className="max-h-48 overflow-y-auto border border-[#2e2e48] rounded-md">
      {issues.map((issue, i) => (
        <li key={issue.id} className={i > 0 ? 'border-t border-[#232340]' : ''}>
          <button
            type="button"
            onClick={() => onSelect(issue)}
            className="w-full text-left px-3 py-2 hover:bg-[#1d1d30] transition-colors"
          >
            <span className="text-xs font-mono text-[#5e6ad2]">{issue.identifier}</span>
            <span className="text-sm text-[#b4b5c8] ml-2">{issue.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ExistingTicketSearch({ screenshotDataUrl, onBack, onSuccess, preselectedIssue }: ExistingTicketSearchProps) {
  const [query, setQuery] = useState('');
  const [comment, setComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<LinearIssueResult | null>(preselectedIssue ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { results, loading: searching } = useIssueSearch(query);
  const { issues: assignedIssues, loading: loadingAssigned } = useRecentIssues();
  const { recentTickets } = useRecentSelections();

  const showSearchResults = query.length >= 2;

  async function handleSubmit() {
    if (!selectedIssue) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await window.api.addComment({
        issueId: selectedIssue.id,
        comment: comment.trim(),
        screenshotDataUrl,
      });

      if (result.success) {
        window.api.saveRecentTicket(selectedIssue);
        onSuccess(selectedIssue);
      } else {
        setError(result.error ?? 'Failed to add comment');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelect(issue: LinearIssueResult) {
    setSelectedIssue(issue);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={onBack}
          className="text-[#6b6f8e] hover:text-[#d2d3e0] text-sm transition-colors"
        >
          &larr; Back
        </button>
        <h2 className="text-sm font-semibold text-[#d2d3e0]">Add to Existing Ticket</h2>
      </div>

      <ScreenshotPreview dataUrl={screenshotDataUrl} />

      {!selectedIssue ? (
        <div>
          <label className="block text-xs font-medium text-[#8b8ea4] mb-1.5">
            Search issues
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or identifier..."
            className="w-full rounded-md bg-[#1d1d30] border border-[#2e2e48] text-[#d2d3e0] placeholder-[#5a5e7a] px-3 py-2 text-sm hover:border-[#3e3e5a] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
            autoFocus
          />

          {showSearchResults ? (
            <>
              {searching && <p className="text-xs text-[#5a5e7a] mt-2">Searching...</p>}
              {results.length > 0 && (
                <div className="mt-1.5">
                  <IssueList issues={results} onSelect={handleSelect} />
                </div>
              )}
              {!searching && results.length === 0 && (
                <p className="text-xs text-[#5a5e7a] mt-2">No issues found</p>
              )}
            </>
          ) : (
            <>
              {recentTickets.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-xs text-[#5a5e7a] mb-1">Recently used in this app</p>
                  <IssueList issues={recentTickets} onSelect={handleSelect} />
                </div>
              )}

              {!loadingAssigned && assignedIssues.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-xs text-[#5a5e7a] mb-1">Your assigned issues</p>
                  <IssueList issues={assignedIssues} onSelect={handleSelect} />
                </div>
              )}

              {loadingAssigned && recentTickets.length === 0 && (
                <p className="text-xs text-[#5a5e7a] mt-2">Loading...</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-[#5e6ad2]/10 border border-[#5e6ad2]/25 rounded-md px-3 py-2 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-mono text-[#5e6ad2]">{selectedIssue.identifier}</span>
              <span className="text-sm text-[#d2d3e0] ml-2">{selectedIssue.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIssue(null)}
              className="text-[#6b6f8e] hover:text-[#d2d3e0] text-xs ml-2 shrink-0 transition-colors"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b8ea4] mb-1.5">
              Comment <span className="text-[#4a4d64]">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Additional context..."
              rows={3}
              className="w-full rounded-md bg-[#1d1d30] border border-[#2e2e48] text-[#d2d3e0] placeholder-[#5a5e7a] px-3 py-2 text-sm hover:border-[#3e3e5a] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] resize-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-[#e5484d] text-xs">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#5e6ad2] text-white rounded-md font-medium text-sm hover:bg-[#6c78e0] transition-colors disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50"
          >
            {submitting ? 'Adding...' : 'Add Screenshot to Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}
