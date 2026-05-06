import React, { useEffect, useRef } from 'react';
import { Dropdown, DropdownOption } from './Dropdown';

function useShortcutKey(key: string | undefined, ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!key) return;

    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
      if (el.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key.toLowerCase() === key!.toLowerCase()) {
        e.preventDefault();
        const btn = ref.current?.querySelector('button');
        btn?.click();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, ref]);
}

function Kbd({ children }: { readonly children: string }) {
  return (
    <kbd className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-surface-input border border-border-subtle text-[10px] font-medium text-content-muted leading-none uppercase">
      {children}
    </kbd>
  );
}

function PillAvatar({ url, name }: { readonly url?: string | null; readonly name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (url) {
    return <img src={url} alt={name} className="w-4 h-4 rounded-full object-cover shrink-0" />;
  }

  return (
    <span className="w-4 h-4 rounded-full bg-border-subtle flex items-center justify-center text-[8px] font-medium text-content-secondary shrink-0">
      {initials}
    </span>
  );
}

interface MetadataPillProps {
  readonly label: string;
  readonly pillIcon?: React.ReactNode;
  readonly options: DropdownOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly panelMinWidth?: number;
  readonly searchPlaceholder?: string;
  readonly shortcutKey?: string;
}

export const MetadataPill = React.memo(MetadataPillImpl);

function MetadataPillImpl({ label, pillIcon, options, value, onChange, disabled, panelMinWidth = 200, searchPlaceholder, shortcutKey }: MetadataPillProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useShortcutKey(shortcutKey, containerRef);

  const selected = options.find((o) => o.value === value);
  const hasAvatar = selected?.avatarUrl !== undefined;

  return (
    <div ref={containerRef} className="inline-flex">
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      searchable={options.length > 6}
      searchPlaceholder={searchPlaceholder}
      panelMinWidth={panelMinWidth}
      renderTrigger={(_sel, isOpen) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] whitespace-nowrap transition-colors cursor-pointer focus-within:ring-1 focus-within:ring-linear-brand ${
          isOpen
            ? 'bg-surface-input border-border-hover text-content'
            : 'border-border text-content-secondary hover:border-border-hover hover:text-content'
        }`}>
          {hasAvatar && selected ? (
            <PillAvatar url={selected.avatarUrl} name={selected.label} />
          ) : pillIcon ? (
            <span className="shrink-0 flex items-center">{pillIcon}</span>
          ) : null}
          {selected ? selected.label : label}
          {shortcutKey && <Kbd>{shortcutKey}</Kbd>}
        </span>
      )}
    />
    </div>
  );
}

interface MultiMetadataPillProps {
  readonly label: string;
  readonly pillIcon?: React.ReactNode;
  readonly options: DropdownOption[];
  readonly values: string[];
  readonly onChange: (values: string[]) => void;
  readonly disabled?: boolean;
  readonly panelMinWidth?: number;
  readonly shortcutKey?: string;
}

export const MultiMetadataPill = React.memo(MultiMetadataPillImpl);

function MultiMetadataPillImpl({ label, pillIcon, options, values, onChange, disabled, panelMinWidth = 200, shortcutKey }: MultiMetadataPillProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useShortcutKey(shortcutKey, containerRef);

  const selectedLabels = options.filter((o) => values.includes(o.value));
  const displayText = selectedLabels.length > 0
    ? selectedLabels.map((l) => l.label).join(', ')
    : label;

  function handleToggle(val: string) {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  }

  return (
    <div ref={containerRef} className="inline-flex">
    <Dropdown
      options={options}
      value={values[0] ?? ''}
      onChange={handleToggle}
      disabled={disabled}
      searchable={options.length > 6}
      panelMinWidth={panelMinWidth}
      renderTrigger={(_sel, isOpen) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] whitespace-nowrap transition-colors cursor-pointer max-w-[180px] ${
          isOpen
            ? 'bg-surface-input border-border-hover text-content'
            : values.length > 0
              ? 'border-border-hover text-content'
              : 'border-border text-content-secondary hover:border-border-hover hover:text-content'
        }`}>
          {pillIcon && <span className="shrink-0 flex items-center">{pillIcon}</span>}
          <span className="truncate">{displayText}</span>
          {shortcutKey && <Kbd>{shortcutKey}</Kbd>}
        </span>
      )}
    />
    </div>
  );
}
