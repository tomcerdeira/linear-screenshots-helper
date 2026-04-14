import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { INPUT_CLASS, BACK_LINK_CLASS } from '../utils/styles';

interface SettingsViewProps {
  readonly onBack?: () => void;
  readonly onClose?: () => void;
}

export function SettingsView({ onBack, onClose }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasKey = maskedKey.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await window.api.getApiKey();
      if (!cancelled && result.success && result.data) {
        setMaskedKey(result.data);
      }
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

      <div className="border-t border-border pt-3">
        <p className="text-xs text-content-secondary">
          <strong className="text-content">Hotkey:</strong> Cmd+Shift+L
        </p>
        <p className="text-xs text-content-ghost mt-1">
          Right-click the tray icon for more options.
        </p>
      </div>
    </div>
  );
}
