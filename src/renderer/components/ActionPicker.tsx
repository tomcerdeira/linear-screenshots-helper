import React from 'react';
import { ScreenshotPreview } from './ScreenshotPreview';
import { useRecentSelections } from '../hooks/useRecentSelections';
import type { LinearIssueResult } from '../../shared/types';

type Action = 'new' | 'existing' | 'settings';

interface ActionPickerProps {
  readonly screenshotDataUrl: string;
  readonly onSelect: (action: Action) => void;
  readonly onDiscard: () => void;
  readonly onQuickAttach: (issue: LinearIssueResult) => void;
}

export function ActionPicker({ screenshotDataUrl, onSelect, onDiscard, onQuickAttach }: ActionPickerProps) {
  const { recentTickets } = useRecentSelections();

  return (
    <div className="flex flex-col gap-4">
      <ScreenshotPreview dataUrl={screenshotDataUrl} />

      {recentTickets.length > 0 && (
        <div>
          <p className="text-xs text-[#5a5e7a] mb-1.5">Add to recent ticket</p>
          <ul className="border border-[#2e2e48] rounded-md">
            {recentTickets.map((issue, i) => (
              <li key={issue.id} className={i > 0 ? 'border-t border-[#232340]' : ''}>
                <button
                  type="button"
                  onClick={() => onQuickAttach(issue)}
                  className="w-full text-left px-3 py-2 hover:bg-[#1d1d30] transition-colors flex items-center gap-2"
                >
                  <span className="text-xs font-mono text-[#5e6ad2] shrink-0">{issue.identifier}</span>
                  <span className="text-sm text-[#b4b5c8] truncate">{issue.title}</span>
                  <svg className="w-3.5 h-3.5 text-[#3e3e5a] shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onSelect('new')}
          className="w-full py-2.5 px-4 bg-[#5e6ad2] text-white rounded-md font-medium text-sm hover:bg-[#6c78e0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50"
        >
          Create New Ticket
        </button>

        <button
          onClick={() => onSelect('existing')}
          className="w-full py-2.5 px-4 bg-[#1d1d30] text-[#d2d3e0] border border-[#2e2e48] rounded-md font-medium text-sm hover:bg-[#232340] hover:border-[#3e3e5a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50"
        >
          Search Other Tickets
        </button>

        <button
          onClick={onDiscard}
          className="w-full py-2 px-4 text-[#5a5e7a] text-sm hover:text-[#8b8ea4] transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
