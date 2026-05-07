import React, { useState, useEffect } from 'react';
import { X, Check, Keyboard, RefreshCw, Download, CheckCircle } from 'lucide-react';
import { INPUT_CLASS, BACK_LINK_CLASS } from '../utils/styles';
import { formatHotkeyForDisplay, keyEventToAccelerator } from '../utils/hotkey';
import type { UpdateInfo } from '../../shared/types';

interface SettingsViewProps {
  readonly onBack?: () => void;
  readonly onClose?: () => void;
  readonly isStandalone?: boolean;
}

interface HotkeyRecorderProps {
  readonly label: string;
  readonly description: string;
  readonly value: string;
  readonly defaultValue: string;
  readonly onSave: (hotkey: string) => Promise<void>;
}

function HotkeyRecorder({ label, description, value, defaultValue, onSave }: HotkeyRecorderProps) {
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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-content-secondary">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (recording) { setRecording(false); }
            else { setPending(null); setRecording(true); }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${
            recording
              ? 'bg-linear-brand/10 border-linear-brand text-content animate-pulse'
              : 'bg-surface-input border-border text-content hover:border-border-hover'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5 text-content-muted" />
          {recording ? 'Press keys...' : displayValue}
          {!recording && !pending && value === defaultValue && (
            <span className="text-[10px] text-content-ghost">default</span>
          )}
        </button>

        {pending && !recording && (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="px-2 py-1 bg-linear-brand text-white rounded-md text-xs font-medium hover:bg-linear-brand-hover transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="px-2 py-1 text-content-ghost text-xs hover:text-content transition-colors"
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
              className="text-xs text-content-ghost hover:text-content transition-colors"
            >
              Change
            </button>
            {value !== defaultValue && (
              <button
                type="button"
                onClick={() => onSave(defaultValue)}
                className="text-xs text-content-ghost hover:text-content transition-colors"
              >
                Reset
              </button>
            )}
          </>
        )}
      </div>
      <p className="text-[11px] text-content-ghost">{description}</p>
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
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'done' | 'error'>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateError, setUpdateError] = useState('');

  const hasKey = maskedKey.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [keyResult, hotkeyResult, collectResult, openQueueResult, versionResult] = await Promise.all([
        window.api.getApiKey(),
        window.api.getHotkey(),
        window.api.getCollectHotkey(),
        window.api.getOpenQueueHotkey(),
        window.api.getAppVersion(),
      ]);
      if (cancelled) return;
      if (keyResult.success && keyResult.data) setMaskedKey(keyResult.data);
      if (hotkeyResult.success && hotkeyResult.data) setHotkey(hotkeyResult.data);
      if (collectResult.success && collectResult.data) setCollectHotkey(collectResult.data);
      if (openQueueResult.success && openQueueResult.data) setOpenQueueHotkey(openQueueResult.data);
      if (versionResult.success && versionResult.data) setAppVersion(versionResult.data);
    }
    load();
    return () => { cancelled = true; };
  }, []);

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
        setUpdateInfo(result.data);
        setUpdateStatus('done');
      } else {
        setUpdateError(result.error ?? 'Failed to check for updates');
        setUpdateStatus('error');
      }
    } catch {
      setUpdateError('Could not reach GitHub');
      setUpdateStatus('error');
    }
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

  const headerPaddingClass = isStandalone ? 'px-6 pt-2 pb-4' : 'p-5';
  const bodyPaddingClass = isStandalone ? 'px-6 pb-6' : 'px-5 pb-5';

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
      <div className={`flex flex-col gap-4 ${bodyPaddingClass} overflow-y-auto flex-1 min-h-0`}>


      {/* API Key */}
      <div className="flex flex-col gap-3">
        <label className="block text-xs font-medium text-content-secondary">
          Linear API Key
        </label>

        {hasKey && !editing ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-surface-input border border-border">
              <div className="w-8 h-8 rounded-full bg-feedback-success/15 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-feedback-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-content">Connected</p>
                <p className="text-xs text-content-ghost font-mono truncate">{maskedKey}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEditing(true); setMessage(null); }}
              className="text-xs text-content-ghost hover:text-content transition-colors text-left"
            >
              Change API key
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-2.5">
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
      <div className="border-t border-border pt-3 flex flex-col gap-3">
        <HotkeyRecorder
          label="Capture Screenshot"
          description="Takes a screenshot and opens the issue creation form."
          value={hotkey}
          defaultValue="CommandOrControl+Shift+L"
          onSave={async (h) => {
            const result = await window.api.setHotkey(h);
            if (result.success) setHotkey(h);
          }}
        />

        <HotkeyRecorder
          label="Collect Screenshot"
          description="Takes a screenshot and adds it to the queue without opening the form."
          value={collectHotkey}
          defaultValue="Alt+CommandOrControl+Shift+L"
          onSave={async (h) => {
            const result = await window.api.setCollectHotkey(h);
            if (result.success) setCollectHotkey(h);
          }}
        />

        <HotkeyRecorder
          label="Open Queued Issue"
          description="Opens the issue creation form with all collected screenshots attached."
          value={openQueueHotkey}
          defaultValue="CommandOrControl+Shift+Return"
          onSave={async (h) => {
            const result = await window.api.setOpenQueueHotkey(h);
            if (result.success) setOpenQueueHotkey(h);
          }}
        />
      </div>

      {/* Updates */}
      <div className="border-t border-border pt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-content-secondary">Updates</label>
            {appVersion && (
              <p className="text-[11px] text-content-ghost">v{appVersion}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={updateStatus === 'checking'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-content hover:border-border-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
            {updateStatus === 'checking' ? 'Checking...' : 'Check for updates'}
          </button>
        </div>

        {updateStatus === 'done' && updateInfo && (
          updateInfo.hasUpdate ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-linear-brand/10 border border-linear-brand/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-content">v{updateInfo.latestVersion} available</p>
                <p className="text-[11px] text-content-ghost">You have v{updateInfo.currentVersion}</p>
              </div>
              <button
                type="button"
                onClick={() => window.api.openExternal(updateInfo.downloadUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-brand text-white rounded-md text-xs font-medium hover:bg-linear-brand-hover transition-colors shrink-0"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-feedback-success/10 border border-feedback-success/30">
              <CheckCircle className="w-4 h-4 text-feedback-success shrink-0" />
              <p className="text-xs text-content">You're on the latest version</p>
            </div>
          )
        )}

        {updateStatus === 'error' && (
          <p className="text-xs text-feedback-error">{updateError}</p>
        )}
      </div>
      </div>
    </div>
  );
}
