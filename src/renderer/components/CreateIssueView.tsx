import React, { useState, useEffect, useMemo } from 'react';
import { X, Image, Paperclip, User, Tag } from 'lucide-react';
import { TeamPicker } from './TeamPicker';
import { ProjectPicker } from './ProjectPicker';
import { ScreenshotPreview } from './ScreenshotPreview';
import { RichTextEditor } from './RichTextEditor';
import { MetadataPill, MultiMetadataPill } from './MetadataPill';
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
  readonly onClose: () => void;
  readonly onSwitchToExisting: () => void;
}

function SkeletonPill() {
  return <span className="skeleton-pill inline-block w-[72px] h-[26px] rounded-full" />;
}

export function CreateIssueView({ screenshotDataUrl, onClose, onSwitchToExisting }: CreateIssueViewProps) {
  const { lastTeamId, lastProjectId, loading: loadingRecent } = useRecentSelections();
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [stateId, setStateId] = useState('');
  const [priority, setPriority] = useState('0');
  const [assigneeId, setAssigneeId] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const formRef = React.useRef({ teamId, projectId, stateId, priority, assigneeId, labelIds, title, description });
  formRef.current = { teamId, projectId, stateId, priority, assigneeId, labelIds, title, description };
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(true);

  const { workflowStates, labels, members, loading: loadingTeamData } = useTeamData(teamId);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
      // I = assign to me (only when not in an editable field)
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return;
      if (e.key === 'i' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const me = members.find((m) => m.isMe);
        if (me) {
          e.preventDefault();
          setAssigneeId(me.id);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, teamId, title, members]);

  // Load last selections
  useEffect(() => {
    if (!loadingRecent && !initialized) {
      if (lastTeamId) setTeamId(lastTeamId);
      if (lastProjectId) setProjectId(lastProjectId);
      setInitialized(true);
    }
  }, [loadingRecent, lastTeamId, lastProjectId, initialized]);

  // Auto-select backlog state when team data loads
  useEffect(() => {
    if (workflowStates.length > 0 && !stateId) {
      const backlog = workflowStates.find((s) => s.type === 'backlog');
      if (backlog) setStateId(backlog.id);
    }
  }, [workflowStates, stateId]);

  function handleTeamChange(id: string) {
    setTeamId(id);
    setStateId('');
    setLabelIds([]);
    setAssigneeId('');
    window.api.saveLastTeam(id);
  }

  function handleProjectChange(id: string) {
    setProjectId(id);
    window.api.saveLastProject(id);
  }

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
      { value: '', label: 'No assignee', renderIcon: <User className="w-4 h-4 text-[#6f6f78]" /> },
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
          <TeamPicker value={teamId} onChange={handleTeamChange} variant="compact" />
          <span className="text-[#5a5e7a] text-xs">&rsaquo;</span>
          <span className="text-[13px] text-[#e2e2ea] font-medium">New issue</span>
        </div>
        <div className="no-drag flex items-center gap-1">
          <button
            type="button"
            onClick={onSwitchToExisting}
            className="px-2 py-1 text-[11px] text-[#5a5e7a] hover:text-[#e2e2ea] hover:bg-[#2a2a2e] rounded transition-colors"
          >
            Attach to existing
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#5a5e7a] hover:text-[#e2e2ea] hover:bg-[#2a2a2e] rounded transition-colors"
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          className="w-full bg-transparent border-none text-[18px] font-medium text-[#e2e2ea] placeholder-[#4a4a55] focus:outline-none p-0 mb-1 ring-0 focus:ring-0"
          autoFocus
        />

        <RichTextEditor onChange={setDescription} />

        {showScreenshot ? (
          <div className="mb-2 relative">
            <ScreenshotPreview dataUrl={screenshotDataUrl} />
            <button
              type="button"
              onClick={() => setShowScreenshot(false)}
              className="absolute top-1.5 right-1.5 p-0.5 bg-[#1f2023]/80 rounded hover:bg-[#333338] transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#8b8ea4]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowScreenshot(true)}
            className="mb-2 flex items-center gap-1.5 text-xs text-[#5a5e7a] hover:text-[#8b8ea4] transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
            1 screenshot attached
          </button>
        )}

        {error && <p className="text-[#e5484d] text-xs mb-1">{error}</p>}
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
                onChange={setStateId}
                panelMinWidth={180}
                shortcutKey="s"
              />
            )}

            <MetadataPill
              label="Priority"
              pillIcon={<PriorityIcon level={parseInt(priority, 10)} className="w-3.5 h-3.5" />}
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={setPriority}
              panelMinWidth={160}
              shortcutKey="p"
            />

            {memberOptions.length > 1 && (
              <MetadataPill
                label="Assignee"
                pillIcon={<AssigneeIcon />}
                options={memberOptions}
                value={assigneeId}
                onChange={setAssigneeId}
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
            onChange={setLabelIds}
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
          className="p-1.5 text-[#5a5e7a] hover:text-[#e2e2ea] hover:bg-[#2a2a2e] rounded transition-colors"
          title="Toggle screenshot preview"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!teamId || !title.trim()}
          className="px-4 py-1.5 bg-[#5e6ad2] text-white rounded-full text-[13px] font-medium hover:bg-[#6c78e0] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Create issue
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
