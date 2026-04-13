import React, { useState, useEffect } from 'react';

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
      className="ml-auto text-[#5a5e7a] hover:text-[#d2d3e0] transition-colors"
      aria-label="Close"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[#6b6f8e] hover:text-[#d2d3e0] text-sm transition-colors"
          >
            &larr; Back
          </button>
        )}
        <h2 className="text-sm font-semibold text-[#d2d3e0]">Settings</h2>
        {closeButton}
      </div>

      <div className="flex flex-col gap-3">
        <label className="block text-xs font-medium text-[#8b8ea4]">
          Linear API Key
        </label>

        {hasKey && !editing ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#1d1d30] border border-[#2e2e48]">
              <div className="w-8 h-8 rounded-full bg-[#30a46c]/15 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#30a46c]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#d2d3e0]">Connected</p>
                <p className="text-xs text-[#5a5e7a] font-mono truncate">{maskedKey}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEditing(true); setMessage(null); }}
              className="text-xs text-[#5a5e7a] hover:text-[#d2d3e0] transition-colors text-left"
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
              className="w-full rounded-md bg-[#1d1d30] border border-[#2e2e48] text-[#d2d3e0] placeholder-[#5a5e7a] px-3 py-2 text-sm hover:border-[#3e3e5a] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
              autoFocus
            />
            <p className="text-xs text-[#5a5e7a]">
              Generate at{' '}
              <span className="text-[#5e6ad2]">linear.app/settings/api</span>
            </p>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="flex-1 py-2 px-4 bg-[#5e6ad2] text-white rounded-md font-medium text-sm hover:bg-[#6c78e0] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {hasKey && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setApiKey(''); setMessage(null); }}
                  className="py-2 px-4 text-[#5a5e7a] hover:text-[#d2d3e0] text-sm rounded-md border border-[#2e2e48] hover:border-[#3e3e5a] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {message && (
          <p className={`text-xs ${message.type === 'success' ? 'text-[#30a46c]' : 'text-[#e5484d]'}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="border-t border-[#232340] pt-3">
        <p className="text-xs text-[#8b8ea4]">
          <strong className="text-[#d2d3e0]">Hotkey:</strong> Cmd+Shift+L
        </p>
        <p className="text-xs text-[#5a5e7a] mt-1">
          Right-click the tray icon for more options.
        </p>
      </div>
    </div>
  );
}
