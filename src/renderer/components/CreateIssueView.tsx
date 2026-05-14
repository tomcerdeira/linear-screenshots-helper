import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { X, Image, Paperclip, User, Tag, GitBranch } from 'lucide-react';
import { TeamPicker } from './TeamPicker';
import { ProjectPicker } from './ProjectPicker';
import { ScreenshotPreview } from './ScreenshotPreview';
import { MetadataPill, MultiMetadataPill } from './MetadataPill';
import type { LinearIssueResult } from '../../shared/types';
import type { RichTextEditorHandle } from './RichTextEditor';

const RichTextEditor = lazy(() =>
  import('./RichTextEditor').then((m) => ({ default: m.RichTextEditor })),
);

function EditorFallback() {
  return <div className="min-h-[40px] text-[14px] text-content-placeholder">Loading editor...</div>;
}
import { PriorityIcon, StatusIcon, LabelDot } from './LinearIcons';
import { useRecentSelections } from '../hooks/useRecentSelections';
import { useTeamData } from '../hooks/useTeamData';
const PRIORITY_OPTIONS = [
  { value: '0', label: 'No priority', renderIcon: <PriorityIcon level={0} className="w-3.5 h-3.5" /> },
  { value: '1', label: 'Urgent', renderIcon: <PriorityIcon level={1} className="w-3.5 h-3.5" /> },
  { value: '2', label: 'High', renderIcon: <PriorityIcon level={2} className="w-3.5 h-3.5" /> },
  { value: '3', label: 'Medium', renderIcon: <PriorityIcon level={3} className="w-3.5 h-3.5" /> },
  { value: '4', label: 'Low', renderIcon: <PriorityIcon level={4} className="w-3.5 h-3.5" /> },
];

interface CreateIssueViewProps {
  readonly screenshotDataUrl: string;
  readonly additionalScreenshots?: string[];
  readonly onClose: () => void;
  readonly onSwitchToExisting: () => void;
  readonly parentIssue?: LinearIssueResult;
  readonly forcedTeamId?: string;
  readonly initialTitle?: string;
  readonly initialDescription?: string;
  readonly initialDescriptionHTML?: string;
  readonly onDraftChange?: (draft: { title: string; description: string; descriptionHTML: string }) => void;
}

function SkeletonPill() {
  return <span className="skeleton-pill inline-block w-[72px] h-[26px] rounded-full" />;
}

export function CreateIssueView({
  screenshotDataUrl,
  additionalScreenshots,
  onClose,
  onSwitchToExisting,
  parentIssue,
  forcedTeamId,
  initialTitle,
  initialDescription,
  initialDescriptionHTML,
  onDraftChange,
}: CreateIssueViewProps) {
  const isSubIssue = Boolean(parentIssue);
  const { lastTeamId, lastProjectId, loading: loadingRecent } = useRecentSelections();
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [stateId, setStateId] = useState('');
  const [priority, setPriority] = useState('0');
  const [assigneeId, setAssigneeId] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [title, setTitle] = useState(initialTitle ?? '');
  const [description, setDescription] = useState(initialDescription ?? '');
  const descriptionHTMLRef = React.useRef(initialDescriptionHTML ?? '');
  const onDraftChangeRef = React.useRef(onDraftChange);
  onDraftChangeRef.current = onDraftChange;
  const formRef = React.useRef({ teamId, projectId, stateId, priority, assigneeId, labelIds, title, description });
  formRef.current = { teamId, projectId, stateId, priority, assigneeId, labelIds, title, description };

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    onDraftChangeRef.current?.({
      title: value,
      description: formRef.current.description,
      descriptionHTML: descriptionHTMLRef.current,
    });
  }, []);

  const handleDescriptionChange = useCallback((markdown: string) => {
    setDescription(markdown);
    onDraftChangeRef.current?.({
      title: formRef.current.title,
      description: markdown,
      descriptionHTML: descriptionHTMLRef.current,
    });
  }, []);

  const handleDescriptionHTMLChange = useCallback((html: string) => {
    descriptionHTMLRef.current = html;
    onDraftChangeRef.current?.({
      title: formRef.current.title,
      description: formRef.current.description,
      descriptionHTML: html,
    });
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(true);
  const editorRef = React.useRef<RichTextEditorHandle>(null);

  const { workflowStates, labels, members, loading: loadingTeamData } = useTeamData(teamId);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
      // Single-key shortcuts (only when not in an editable field)
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'e') {
        e.preventDefault();
        onSwitchToExisting();
        return;
      }
      if (e.key === 'i') {
        const me = members.find((m) => m.isMe);
        if (me) { e.preventDefault(); setAssigneeId(me.id); }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, teamId, title, members]);

  // Load last selections (or forced team for sub-issue)
  useEffect(() => {
    if (forcedTeamId) {
      setTeamId(forcedTeamId);
      setInitialized(true);
      return;
    }
    if (!loadingRecent && !initialized) {
      if (lastTeamId) setTeamId(lastTeamId);
      if (lastProjectId) setProjectId(lastProjectId);
      setInitialized(true);
    }
  }, [loadingRecent, lastTeamId, lastProjectId, initialized, forcedTeamId]);

  // Auto-select backlog state when team data loads
  useEffect(() => {
    if (workflowStates.length > 0 && !stateId) {
      const backlog = workflowStates.find((s) => s.type === 'backlog');
      if (backlog) setStateId(backlog.id);
    }
  }, [workflowStates, stateId]);

  const handleTeamChange = useCallback((id: string) => {
    setTeamId(id);
    setStateId('');
    setLabelIds([]);
    setAssigneeId('');
    window.api.saveLastTeam(id);
  }, []);

  const handleProjectChange = useCallback((id: string) => {
    setProjectId(id);
    window.api.saveLastProject(id);
  }, []);

  const handleStateChange = useCallback((id: string) => setStateId(id), []);
  const handlePriorityChange = useCallback((p: string) => setPriority(p), []);
  const handleAssigneeChange = useCallback((id: string) => setAssigneeId(id), []);
  const handleLabelsChange = useCallback((ids: string[]) => setLabelIds(ids), []);

  function handleSubmit() {
    const form = formRef.current;
    if (!form.teamId || !form.title.trim()) {
      setError('Team and title are required');
      return;
    }

    // Fire-and-forget: close immediately, create in background
    window.api.createIssueBg({
      teamId: form.teamId,
      projectId: form.projectId || undefined,
      stateId: form.stateId || undefined,
      priority: form.priority !== '0' ? parseInt(form.priority, 10) : undefined,
      assigneeId: form.assigneeId || undefined,
      labelIds: form.labelIds.length > 0 ? form.labelIds : undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      screenshotDataUrl,
      additionalScreenshotDataUrls: additionalScreenshots,
      parentId: parentIssue?.id,
    });
    onClose();
  }

  const selectedState = workflowStates.find((s) => s.id === stateId);

  const stateOptions = useMemo(() =>
    workflowStates.map((s) => ({
      value: s.id,
      label: s.name,
      renderIcon: <StatusIcon type={s.type} color={s.color} className="w-3.5 h-3.5" />,
    })),
    [workflowStates],
  );

  const labelOptions = useMemo(() =>
    labels.map((l) => ({
      value: l.id,
      label: l.name,
      renderIcon: <LabelDot color={l.color} className="w-3 h-3" />,
    })),
    [labels],
  );

  const memberOptions = useMemo(() => {
    const me = members.find((m) => m.isMe);
    const others = members.filter((m) => !m.isMe);

    return [
      { value: '', label: 'No assignee', renderIcon: <User className="w-4 h-4 text-content-muted" /> },
      ...(me ? [{ value: me.id, label: me.displayName, avatarUrl: me.avatarUrl }] : []),
      ...others.map((m) => ({ value: m.id, label: m.displayName, avatarUrl: m.avatarUrl, group: 'Team members' })),
    ];
  }, [members]);

  const showTeamPills = teamId.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 drag-handle">
        <div className="no-drag flex items-center gap-2 flex-1 min-w-0">
          {isSubIssue && parentIssue ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <GitBranch className="w-3.5 h-3.5 text-content-ghost shrink-0" />
              <span className="text-[13px] text-content font-medium shrink-0">New sub-issue of</span>
              <span className="text-xs font-mono text-linear-brand shrink-0">{parentIssue.identifier}</span>
              <span className="text-[13px] text-content-secondary truncate">{parentIssue.title}</span>
            </div>
          ) : (
            <>
              <TeamPicker value={teamId} onChange={handleTeamChange} variant="compact" />
              <span className="text-content-ghost text-xs">&rsaquo;</span>
              <span className="text-[13px] text-content font-medium">New issue</span>
            </>
          )}
        </div>
        <div className="no-drag flex items-center gap-1">
          <button
            type="button"
            onClick={onSwitchToExisting}
            className="px-2 py-1 text-[11px] text-content-ghost hover:text-content hover:bg-surface-input rounded transition-colors flex items-center gap-1"
          >
            {isSubIssue ? 'Attach as comment' : 'Attach to existing'}
            <kbd className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded bg-surface-input border border-border-subtle text-[9px] font-medium text-content-muted leading-none uppercase">E</kbd>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-content-ghost hover:text-content hover:bg-surface-input rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col overflow-y-auto px-5 py-3"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            (document.activeElement as HTMLElement)?.blur();
          }
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              editorRef.current?.focus();
            }
          }}
          placeholder={isSubIssue ? 'Sub-issue title' : 'Issue title'}
          className="w-full bg-transparent border-none text-[18px] font-medium text-content placeholder-content-placeholder focus:outline-none p-0 mb-1 ring-0 focus:ring-0"
          autoFocus
        />

        <Suspense fallback={<EditorFallback />}>
          <RichTextEditor
            ref={editorRef}
            onChange={handleDescriptionChange}
            onHTMLChange={handleDescriptionHTMLChange}
            initialContent={initialDescriptionHTML}
          />
        </Suspense>

        {(() => {
          const allScreenshots = [screenshotDataUrl, ...(additionalScreenshots ?? [])];
          const count = allScreenshots.length;

          if (showScreenshot) {
            return (
              <div className="mb-2 flex flex-col gap-2">
                {allScreenshots.map((url, i) => (
                  <div key={i} className="relative">
                    <ScreenshotPreview dataUrl={url} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowScreenshot(false)}
                  className="flex items-center gap-1.5 text-xs text-content-ghost hover:text-content-secondary transition-colors"
                >
                  <X className="w-3 h-3" />
                  Hide {count > 1 ? `${count} screenshots` : 'screenshot'}
                </button>
              </div>
            );
          }

          return (
            <button
              type="button"
              onClick={() => setShowScreenshot(true)}
              className="mb-2 flex items-center gap-1.5 text-xs text-content-ghost hover:text-content-secondary transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              {count} screenshot{count > 1 ? 's' : ''} attached
            </button>
          );
        })()}

        {error && <p className="text-feedback-error text-xs mb-1">{error}</p>}
      </div>

      {/* Metadata pills */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {showTeamPills && loadingTeamData ? (
          <>
            <SkeletonPill />
            <SkeletonPill />
            <SkeletonPill />
          </>
        ) : showTeamPills ? (
          <>
            {stateOptions.length > 0 && (
              <MetadataPill
                label="Status"
                pillIcon={selectedState ? <StatusIcon type={selectedState.type} color={selectedState.color} className="w-3.5 h-3.5" /> : undefined}
                options={stateOptions}
                value={stateId}
                onChange={handleStateChange}
                panelMinWidth={180}
                shortcutKey="s"
              />
            )}

            <MetadataPill
              label="Priority"
              pillIcon={<PriorityIcon level={parseInt(priority, 10)} className="w-3.5 h-3.5" />}
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={handlePriorityChange}
              panelMinWidth={160}
              shortcutKey="p"
            />

            {memberOptions.length > 1 && (
              <MetadataPill
                label="Assignee"
                pillIcon={<AssigneeIcon />}
                options={memberOptions}
                value={assigneeId}
                onChange={handleAssigneeChange}
                panelMinWidth={240}
                searchPlaceholder="Assign to..."
                shortcutKey="a"
              />
            )}
          </>
        ) : null}

        <ProjectPicker value={projectId} onChange={handleProjectChange} variant="pill" />

        {showTeamPills && !loadingTeamData && labelOptions.length > 0 && (
          <MultiMetadataPill
            label="Labels"
            pillIcon={<LabelIcon />}
            options={labelOptions}
            values={labelIds}
            onChange={handleLabelsChange}
            panelMinWidth={200}
            shortcutKey="l"
          />
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-2.5 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => setShowScreenshot(!showScreenshot)}
          className="p-1.5 text-content-ghost hover:text-content hover:bg-surface-input rounded transition-colors"
          title="Toggle screenshot preview"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!teamId || !title.trim()}
          className="px-4 py-1.5 bg-linear-brand text-white rounded-full text-[13px] font-medium hover:bg-linear-brand-hover transition-colors disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-linear-brand/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
        >
          {isSubIssue ? 'Create sub-issue' : 'Create issue'}
        </button>
      </div>
    </div>
  );
}

function AssigneeIcon() {
  return <User className="w-3.5 h-3.5" />;
}

function LabelIcon() {
  return <Tag className="w-3.5 h-3.5" />;
}
