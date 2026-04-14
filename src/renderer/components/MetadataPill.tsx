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

function PillAvatar({ url, name }: { readonly url?: string | null; readonly name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (url) {
    return <img src={url} alt={name} className="w-4 h-4 rounded-full object-cover shrink-0" />;
  }

  return (
    <span className="w-4 h-4 rounded-full bg-[#3b3b40] flex items-center justify-center text-[8px] font-medium text-[#9b9ba4] shrink-0">
      {initials}
    </span>
  );
}

export function MetadataPill({ label, pillIcon, options, value, onChange, disabled, panelMinWidth = 200, searchPlaceholder, shortcutKey }: MetadataPillProps) {
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] whitespace-nowrap transition-colors cursor-pointer ${
          isOpen
            ? 'bg-[#2a2a2e] border-[#444450] text-[#e2e2ea]'
            : 'border-[#333338] text-[#8b8ea4] hover:border-[#444450] hover:text-[#e2e2ea]'
        }`}>
          {hasAvatar && selected ? (
            <PillAvatar url={selected.avatarUrl} name={selected.label} />
          ) : pillIcon ? (
            <span className="shrink-0 flex items-center">{pillIcon}</span>
          ) : null}
          {selected ? selected.label : label}
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

export function MultiMetadataPill({ label, pillIcon, options, values, onChange, disabled, panelMinWidth = 200, shortcutKey }: MultiMetadataPillProps) {
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
            ? 'bg-[#2a2a2e] border-[#444450] text-[#e2e2ea]'
            : values.length > 0
              ? 'border-[#444450] text-[#e2e2ea]'
              : 'border-[#333338] text-[#8b8ea4] hover:border-[#444450] hover:text-[#e2e2ea]'
        }`}>
          {pillIcon && <span className="shrink-0 flex items-center">{pillIcon}</span>}
          <span className="truncate">{displayText}</span>
        </span>
      )}
    />
    </div>
  );
}
