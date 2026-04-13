import React, { useState, useEffect } from 'react';
import { ScreenshotPreview } from './ScreenshotPreview';
import { TeamPicker } from './TeamPicker';
import { ProjectPicker } from './ProjectPicker';
import { useRecentSelections } from '../hooks/useRecentSelections';
import type { LinearIssueResult } from '../../shared/types';

interface NewTicketFormProps {
  readonly screenshotDataUrl: string;
  readonly onBack: () => void;
  readonly onSuccess: (issue: LinearIssueResult) => void;
}

export function NewTicketForm({ screenshotDataUrl, onBack, onSuccess }: NewTicketFormProps) {
  const { lastTeamId, lastProjectId, loading: loadingRecent } = useRecentSelections();
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loadingRecent && !initialized) {
      if (lastTeamId) setTeamId(lastTeamId);
      if (lastProjectId) setProjectId(lastProjectId);
      setInitialized(true);
    }
  }, [loadingRecent, lastTeamId, lastProjectId, initialized]);

  function handleTeamChange(id: string) {
    setTeamId(id);
    window.api.saveLastTeam(id);
  }

  function handleProjectChange(id: string) {
    setProjectId(id);
    window.api.saveLastProject(id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!teamId || !title.trim()) {
      setError('Team and title are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await window.api.createIssue({
        teamId,
        projectId: projectId || undefined,
        title: title.trim(),
        description: description.trim(),
        screenshotDataUrl,
      });

      if (result.success && result.data) {
        window.api.saveRecentTicket(result.data);
        onSuccess(result.data);
      } else {
        setError(result.error ?? 'Failed to create issue');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={onBack}
          className="text-[#6b6f8e] hover:text-[#d2d3e0] text-sm transition-colors"
        >
          &larr; Back
        </button>
        <h2 className="text-sm font-semibold text-[#d2d3e0]">New Ticket</h2>
      </div>

      <ScreenshotPreview dataUrl={screenshotDataUrl} />

      <div>
        <label className="block text-xs font-medium text-[#8b8ea4] mb-1.5">Team</label>
        <TeamPicker value={teamId} onChange={handleTeamChange} />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8ea4] mb-1.5">Project</label>
        <ProjectPicker value={projectId} onChange={handleProjectChange} />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8ea4] mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title..."
          className="w-full rounded-md bg-[#1d1d30] border border-[#2e2e48] text-[#d2d3e0] placeholder-[#5a5e7a] px-3 py-2 text-sm hover:border-[#3e3e5a] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8ea4] mb-1.5">
          Description <span className="text-[#4a4d64]">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional context..."
          rows={2}
          className="w-full rounded-md bg-[#1d1d30] border border-[#2e2e48] text-[#d2d3e0] placeholder-[#5a5e7a] px-3 py-2 text-sm hover:border-[#3e3e5a] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] resize-none transition-colors"
        />
      </div>

      {error && (
        <p className="text-[#e5484d] text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !teamId || !title.trim()}
        className="w-full py-2.5 px-4 bg-[#5e6ad2] text-white rounded-md font-medium text-sm hover:bg-[#6c78e0] transition-colors disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50"
      >
        {submitting ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
}
