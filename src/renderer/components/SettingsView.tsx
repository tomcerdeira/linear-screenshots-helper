import React, { useState, useEffect } from 'react';
import { X, Check, Keyboard, RefreshCw, CheckCircle, Info } from 'lucide-react';
import { INPUT_CLASS, BACK_LINK_CLASS } from '../utils/styles';
import { formatHotkeyForDisplay, keyEventToAccelerator } from '../utils/hotkey';
import type { UpdateInfo, UpdateState, UpdateStatus } from '../../shared/types';

interface SettingsViewProps {
  readonly onBack?: () => void;
  readonly onClose?: () => void;
  readonly isStandalone?: boolean;
}

interface HotkeyRecorderProps {
  readonly label: string;
  readonly hint: string;
  readonly value: string;
  readonly defaultValue: string;
  readonly onSave: (hotkey: string) => Promise<void>;
}

function HotkeyRecorder({ label, hint, value, defaultValue, onSave }: HotkeyRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!recording) return;

    function onKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRecording(false);
        setPending(null);
        return;
      }

      const accelerator = keyEventToAccelerator(e);
      if (accelerator) {
        setPending(accelerator);
        setRecording(false);
      }
    }

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [recording]);

  async function handleSave() {
    if (!pending) return;
    await onSave(pending);
    setPending(null);
  }

  const displayValue = formatHotkeyForDisplay(pending ?? value);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs font-medium text-content-secondary">{label}</label>
        <div className="relative group">
          <Info className="w-3 h-3 text-content-ghost cursor-help" />
          <div className="absolute left-0 top-full mt-1.5 px-2.5 py-1.5 rounded-md bg-surface-raised border border-border text-[11px] text-content-secondary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
            {hint}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {pending && !recording && (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="px-2 py-0.5 bg-linear-brand text-white rounded-md text-[11px] font-medium hover:bg-linear-brand-hover transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="px-1 py-0.5 text-content-ghost text-[11px] hover:text-content transition-colors"
            >
              Cancel
            </button>
          </>
        )}

        {!pending && !recording && (
          <>
            <button
              type="button"
              onClick={() => setRecording(true)}
              className="text-[11px] text-content-ghost hover:text-content transition-colors"
            >
              Change
            </button>
            {value !== defaultValue && (
              <button
                type="button"
                onClick={() => onSave(defaultValue)}
                className="text-[11px] text-content-ghost hover:text-content transition-colors"
              >
                Reset
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => {
            if (recording) { setRecording(false); }
            else { setPending(null); setRecording(true); }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
            recording
              ? 'bg-linear-brand/10 border-linear-brand text-content animate-pulse'
              : 'bg-surface-input border-border text-content hover:border-border-hover'
          }`}
        >
          <Keyboard className="w-3 h-3 text-content-muted" />
          {recording ? 'Press keys...' : displayValue}
        </button>
      </div>
    </div>
  );
}

export function SettingsView({ onBack, onClose, isStandalone = false }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hotkey, setHotkey] = useState('');
  const [collectHotkey, setCollectHotkey] = useState('');
  const [openQueueHotkey, setOpenQueueHotkey] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateError, setUpdateError] = useState('');

  const hasKey = maskedKey.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [keyResult, hotkeyResult, collectResult, openQueueResult, versionResult, autoCheckResult, updateStateResult] = await Promise.all([
        window.api.getApiKey(),
        window.api.getHotkey(),
        window.api.getCollectHotkey(),
        window.api.getOpenQueueHotkey(),
        window.api.getAppVersion(),
        window.api.getAutoCheckForUpdates(),
        window.api.getUpdateState(),
      ]);
      if (cancelled) return;
      if (keyResult.success && keyResult.data) setMaskedKey(keyResult.data);
      if (hotkeyResult.success && hotkeyResult.data) setHotkey(hotkeyResult.data);
      if (collectResult.success && collectResult.data) setCollectHotkey(collectResult.data);
      if (openQueueResult.success && openQueueResult.data) setOpenQueueHotkey(openQueueResult.data);
      if (versionResult.success && versionResult.data) setAppVersion(versionResult.data);
      if (autoCheckResult.success && typeof autoCheckResult.data === 'boolean') setAutoCheckUpdates(autoCheckResult.data);
      if (updateStateResult.success && updateStateResult.data) applyUpdateState(updateStateResult.data);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (updateStatus !== 'checking' && updateStatus !== 'downloading') return;
    const interval = window.setInterval(() => {
      window.api.getUpdateState().then((result) => {
        if (result.success && result.data) applyUpdateState(result.data);
      });
    }, 1500);
    return () => window.clearInterval(interval);
  }, [updateStatus]);

  function applyUpdateState(state: UpdateState): void {
    setAutoCheckUpdates(state.autoCheckEnabled);
    setUpdateStatus(state.status);
    setUpdateError(state.error ?? '');
    if (state.latestVersion || state.releaseUrl) {
      setUpdateInfo((current) => ({
        hasUpdate: state.latestVersion ? state.latestVersion !== state.currentVersion : current?.hasUpdate ?? false,
        currentVersion: state.currentVersion,
        latestVersion: state.latestVersion ?? current?.latestVersion ?? state.currentVersion,
        downloadUrl: current?.downloadUrl ?? state.releaseUrl ?? '',
        releaseUrl: state.releaseUrl ?? current?.releaseUrl ?? '',
        status: state.status,
        canInstall: state.canInstall,
        error: state.error,
      }));
    }
  }

  function applyUpdateInfo(info: UpdateInfo): void {
    setUpdateInfo(info);
    setUpdateStatus(info.status ?? (info.hasUpdate ? 'available' : 'not-available'));
    setUpdateError(info.error ?? '');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const result = await window.api.setApiKey(apiKey.trim());
      if (result.success) {
        setMessage({ type: 'success', text: 'API key saved' });
        setApiKey('');
        setEditing(false);
        const updated = await window.api.getApiKey();
        if (updated.success && updated.data) setMaskedKey(updated.data);
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Failed to save' });
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckForUpdates() {
    setUpdateStatus('checking');
    setUpdateError('');
    setUpdateInfo(null);
    try {
      const result = await window.api.checkForUpdates();
      if (result.success && result.data) {
        applyUpdateInfo(result.data);
      } else {
        setUpdateError(result.error ?? 'Failed to check for updates');
        setUpdateStatus('error');
      }
    } catch {
      setUpdateError('Could not reach GitHub');
      setUpdateStatus('error');
    }
  }

  async function handleInstallUpdate() {
    setUpdateStatus(updateStatus === 'ready' ? 'ready' : 'downloading');
    setUpdateError('');
    try {
      const result = await window.api.startUpdateInstall();
      if (result.success && result.data) {
        applyUpdateInfo(result.data);
      } else {
        setUpdateError(result.error ?? 'Failed to start update');
        setUpdateStatus('error');
      }
    } catch {
      setUpdateError('Failed to start update');
      setUpdateStatus('error');
    }
  }

  async function handleAutoCheckChange(enabled: boolean) {
    setAutoCheckUpdates(enabled);
    await window.api.setAutoCheckForUpdates(enabled);
  }

  const closeButton = onClose && (
    <button
      type="button"
      onClick={onClose}
      className="ml-auto text-content-ghost hover:text-content transition-colors"
      aria-label="Close"
    >
      <X className="w-4 h-4" />
    </button>
  );

  const headerPaddingClass = isStandalone ? 'px-6 pt-1 pb-3' : 'p-5';
  const bodyPaddingClass = isStandalone ? 'px-6 pb-5' : 'px-5 pb-5';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className={`${headerPaddingClass} flex items-center gap-2 shrink-0`}>
        {onBack && (
          <button type="button" onClick={onBack} className={BACK_LINK_CLASS}>
            &larr; Back
          </button>
        )}
        <h2 className={`font-semibold text-content ${isStandalone ? 'text-base tracking-tight' : 'text-sm'}`}>
          Settings
        </h2>
        {closeButton}
      </div>
      <div className={`flex flex-col gap-3 ${bodyPaddingClass} overflow-y-auto flex-1 min-h-0`}>

      {/* API Key */}
      <div className="flex flex-col gap-2">
        {hasKey && !editing ? (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-content-secondary shrink-0">Linear API Key</label>
            <Check className="w-3.5 h-3.5 text-feedback-success shrink-0" />
            <span className="text-xs text-content-ghost font-mono truncate">{maskedKey}</span>
            <button
              type="button"
              onClick={() => { setEditing(true); setMessage(null); }}
              className="ml-auto text-xs text-content-ghost hover:text-content transition-colors shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-2.5">
            <label className="block text-xs font-medium text-content-secondary">Linear API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="lin_api_..."
              className={INPUT_CLASS}
              autoFocus
            />
            <p className="text-xs text-content-ghost">
              Create a personal API key in Linear Settings.{' '}
              <button
                type="button"
                onClick={() => window.api.openExternal('https://linear.app/settings/account/security')}
                className="text-linear-brand hover:underline"
              >
                Open Linear Settings &rarr;
              </button>
            </p>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="flex-1 py-2 px-4 bg-linear-brand text-white rounded-md font-medium text-sm hover:bg-linear-brand-hover transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {hasKey && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setApiKey(''); setMessage(null); }}
                  className="py-2 px-4 text-content-ghost hover:text-content text-sm rounded-md border border-border hover:border-border-hover transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {message && (
          <p className={`text-xs ${message.type === 'success' ? 'text-feedback-success' : 'text-feedback-error'}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Hotkeys */}
      <div className="border-t border-border pt-2.5 flex flex-col gap-2">
        <label className="block text-xs font-medium text-content-secondary">Keyboard Shortcuts</label>
        <HotkeyRecorder
          label="Capture"
          hint="Takes a screenshot and opens the issue form"
          value={hotkey}
          defaultValue="CommandOrControl+Shift+L"
          onSave={async (h) => {
            const result = await window.api.setHotkey(h);
            if (result.success) setHotkey(h);
          }}
        />
        <HotkeyRecorder
          label="Collect to queue"
          hint="Takes a screenshot and adds it to the queue silently"
          value={collectHotkey}
          defaultValue="Alt+CommandOrControl+Shift+L"
          onSave={async (h) => {
            const result = await window.api.setCollectHotkey(h);
            if (result.success) setCollectHotkey(h);
          }}
        />
        <HotkeyRecorder
          label="Open queued issue"
          hint="Opens the form with all queued screenshots attached"
          value={openQueueHotkey}
          defaultValue="CommandOrControl+Shift+Return"
          onSave={async (h) => {
            const result = await window.api.setOpenQueueHotkey(h);
            if (result.success) setOpenQueueHotkey(h);
          }}
        />
      </div>
      </div>

      {/* Updates — sticky bottom */}
      <div className={`${isStandalone ? 'px-6 pb-5' : 'px-5 pb-5'} mt-auto shrink-0 border-t border-border pt-2.5 flex flex-col gap-2`}>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-content-secondary">Updates</label>
            {appVersion && (
              <span className="text-[11px] text-content-ghost ml-1.5">v{appVersion}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCheckUpdates}
                onChange={(e) => handleAutoCheckChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border bg-surface text-linear-brand focus:ring-linear-brand"
              />
              <span className="text-[11px] text-content-ghost">Auto-check</span>
            </label>
            <button
              type="button"
              onClick={handleCheckForUpdates}
              disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-[11px] text-content hover:border-border-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${updateStatus === 'checking' || updateStatus === 'downloading' ? 'animate-spin' : ''}`} />
              {updateStatus === 'checking'
                ? 'Checking...'
                : updateStatus === 'downloading'
                  ? 'Downloading...'
                  : 'Check'}
            </button>
          </div>
        </div>

        {updateInfo && (
          updateInfo.hasUpdate ? (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-linear-brand/10 border border-linear-brand/30">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-content">
                  {updateStatus === 'ready' ? 'Update ready to install' : `v${updateInfo.latestVersion} available`}
                </p>
                <p className="text-[11px] text-content-ghost">
                  {updateStatus === 'downloading'
                    ? 'Downloading in the background...'
                    : updateStatus === 'unsupported'
                      ? 'Open a packaged build to install automatically.'
                      : `You have v${updateInfo.currentVersion}`}
                </p>
              </div>
              <button
                type="button"
                onClick={updateStatus === 'unsupported'
                  ? () => window.api.openExternal(updateInfo.releaseUrl)
                  : handleInstallUpdate}
                disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-linear-brand text-white rounded-md text-[11px] font-medium hover:bg-linear-brand-hover transition-colors shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${updateStatus === 'downloading' ? 'animate-spin' : ''}`} />
                {updateStatus === 'ready'
                  ? 'Restart & Install'
                  : updateStatus === 'unsupported'
                    ? 'View release'
                    : updateStatus === 'downloading'
                      ? 'Downloading...'
                      : 'Install'}
              </button>
            </div>
          ) : updateStatus === 'not-available' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-feedback-success/10 border border-feedback-success/30">
              <CheckCircle className="w-3.5 h-3.5 text-feedback-success shrink-0" />
              <p className="text-[11px] text-content">You're on the latest version</p>
            </div>
          ) : null
        )}

        {updateStatus === 'error' && (
          <p className="text-[11px] text-feedback-error">{updateError}</p>
        )}
      </div>
    </div>
  );
}
