import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Keyboard } from 'lucide-react';
import { INPUT_CLASS, BACK_LINK_CLASS } from '../utils/styles';

interface SettingsViewProps {
  readonly onBack?: () => void;
  readonly onClose?: () => void;
}

const IS_MAC = navigator.userAgent.includes('Mac');

function formatHotkeyForDisplay(accelerator: string): string {
  return accelerator
    .replace('CommandOrControl', IS_MAC ? 'Cmd' : 'Ctrl')
    .replace('Command', 'Cmd')
    .replace('Control', 'Ctrl')
    .replace('Shift', 'Shift')
    .replace('Alt', 'Alt')
    .replace('Option', 'Alt')
    .replace(/\+/g, ' + ');
}

function keyEventToAccelerator(e: KeyboardEvent): string | null {
  const parts: string[] = [];

  if (e.metaKey) parts.push('CommandOrControl');
  if (e.ctrlKey && !e.metaKey) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  const key = e.key;
  if (['Meta', 'Control', 'Alt', 'Shift'].includes(key)) return null;

  if (key.length === 1) {
    parts.push(key.toUpperCase());
  } else {
    const keyMap: Record<string, string> = {
      ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
      Backspace: 'Backspace', Delete: 'Delete', Enter: 'Return', Escape: 'Escape',
      Tab: 'Tab', ' ': 'Space',
    };
    const mapped = keyMap[key] ?? key;
    parts.push(mapped);
  }

  if (parts.length < 2) return null;

  return parts.join('+');
}

export function SettingsView({ onBack, onClose }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hotkey, setHotkey] = useState('');
  const [recording, setRecording] = useState(false);
  const [pendingHotkey, setPendingHotkey] = useState<string | null>(null);

  const hasKey = maskedKey.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [keyResult, hotkeyResult] = await Promise.all([
        window.api.getApiKey(),
        window.api.getHotkey(),
      ]);
      if (cancelled) return;
      if (keyResult.success && keyResult.data) setMaskedKey(keyResult.data);
      if (hotkeyResult.success && hotkeyResult.data) setHotkey(hotkeyResult.data);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!recording) return;

    function onKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRecording(false);
        setPendingHotkey(null);
        return;
      }

      const accelerator = keyEventToAccelerator(e);
      if (accelerator) {
        setPendingHotkey(accelerator);
        setRecording(false);
      }
    }

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [recording]);

  async function saveHotkey() {
    if (!pendingHotkey) return;
    const result = await window.api.setHotkey(pendingHotkey);
    if (result.success) {
      setHotkey(pendingHotkey);
      setPendingHotkey(null);
    }
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

  const displayHotkey = pendingHotkey
    ? formatHotkeyForDisplay(pendingHotkey)
    : formatHotkeyForDisplay(hotkey);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        {onBack && (
          <button type="button" onClick={onBack} className={BACK_LINK_CLASS}>
            &larr; Back
          </button>
        )}
        <h2 className="text-sm font-semibold text-content">Settings</h2>
        {closeButton}
      </div>

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
              Generate at{' '}
              <span className="text-linear-brand">linear.app/settings/api</span>
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

      {/* Hotkey */}
      <div className="border-t border-border pt-3 flex flex-col gap-2">
        <label className="block text-xs font-medium text-content-secondary">
          Screenshot Hotkey
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (recording) {
                setRecording(false);
              } else {
                setPendingHotkey(null);
                setRecording(true);
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
              recording
                ? 'bg-linear-brand/10 border-linear-brand text-content animate-pulse'
                : 'bg-surface-input border-border text-content hover:border-border-hover'
            }`}
          >
            <Keyboard className="w-4 h-4 text-content-muted" />
            {recording ? 'Press a key combination...' : displayHotkey}
          </button>

          {pendingHotkey && !recording && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={saveHotkey}
                className="px-2.5 py-1.5 bg-linear-brand text-white rounded-md text-xs font-medium hover:bg-linear-brand-hover transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setPendingHotkey(null)}
                className="px-2.5 py-1.5 text-content-ghost text-xs hover:text-content transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {!pendingHotkey && !recording && (
            <button
              type="button"
              onClick={() => setRecording(true)}
              className="text-xs text-content-ghost hover:text-content transition-colors"
            >
              Change
            </button>
          )}
        </div>

        <p className="text-xs text-content-ghost">
          Click the hotkey, then press your desired key combination.
        </p>
      </div>
    </div>
  );
}
