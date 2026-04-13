import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { shortcodeToEmoji } from '../utils/emoji';

export interface DropdownOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: string | null;
  readonly secondary?: string;
}

interface DropdownProps {
  readonly options: DropdownOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly searchable?: boolean;
}

interface PanelPosition {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly direction: 'down' | 'up';
}

function EmojiIcon({ icon }: { readonly icon: string | null | undefined }) {
  const emoji = shortcodeToEmoji(icon);
  if (!emoji) return null;
  return (
    <span className="inline-flex items-center justify-center shrink-0 w-[22px] h-[22px] text-[16px] leading-none overflow-hidden">
      {emoji}
    </span>
  );
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.secondary?.toLowerCase().includes(search.toLowerCase()) ?? false),
      )
    : options;

  // Compute position relative to the trigger button
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelMaxH = 260;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const direction = spaceBelow >= panelMaxH || spaceBelow >= spaceAbove ? 'down' : 'up';

    setPosition({
      top: direction === 'down' ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      width: rect.width,
      direction,
    });
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setSearch('');
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Position + focus on open
  useEffect(() => {
    if (!open) {
      setHighlightIndex(-1);
      return;
    }
    updatePosition();
    // Focus the search input or the list after portal mounts
    requestAnimationFrame(() => {
      if (searchable && searchRef.current) {
        searchRef.current.focus();
      }
    });
  }, [open, searchable, updatePosition]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex]);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    setSearch('');
    buttonRef.current?.focus();
  }

  function handleKeyNav(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setSearch('');
        buttonRef.current?.focus();
        break;
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            if (open) setSearch('');
          }
        }}
        onKeyDown={handleKeyNav}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'w-full flex items-center justify-between gap-2 px-3 py-[7px] rounded-[5px] text-sm text-left transition-all duration-100',
          'bg-[#1d1d30] border',
          open
            ? 'border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/30'
            : 'border-[#2e2e48] hover:border-[#3e3e5a]',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {selected ? (
          <span className="flex items-center gap-2 text-[#e2e2ea] truncate min-w-0">
            <EmojiIcon icon={selected.icon} />
            <span className="truncate">{selected.label}</span>
            {selected.secondary && (
              <span className="text-[#5a5e7a] text-xs shrink-0">{selected.secondary}</span>
            )}
          </span>
        ) : (
          <span className="text-[#5a5e7a]">{disabled ? 'Loading...' : placeholder}</span>
        )}
        <svg
          className={[
            'w-3.5 h-3.5 text-[#5a5e7a] shrink-0 transition-transform duration-150',
            open ? 'rotate-180' : '',
          ].join(' ')}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && position && createPortal(
        <div
          ref={panelRef}
          onKeyDown={handleKeyNav}
          style={{
            position: 'fixed',
            left: position.left,
            width: position.width,
            zIndex: 9999,
            ...(position.direction === 'down'
              ? { top: position.top }
              : { bottom: window.innerHeight - position.top }),
          }}
          className="rounded-[6px] bg-[#1a1a2e] border border-[#2e2e48] shadow-2xl shadow-black/60 overflow-hidden animate-in"
        >
          {searchable && (
            <div className="p-1.5 border-b border-[#2a2a42]">
              <div className="flex items-center gap-2 px-2 py-1 rounded-[4px] bg-[#232340]">
                <svg className="w-3.5 h-3.5 text-[#5a5e7a] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyNav}
                  placeholder="Search..."
                  className="flex-1 bg-transparent border-none text-[13px] text-[#e2e2ea] placeholder-[#5a5e7a] focus:outline-none p-0 m-0 ring-0 focus:ring-0"
                />
              </div>
            </div>
          )}

          <ul
            ref={listRef}
            role="listbox"
            className="max-h-[220px] overflow-y-auto py-0.5"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-5 text-[13px] text-[#5a5e7a] text-center">
                No results found
              </li>
            )}
            {filtered.map((option, i) => {
              const isSelected = option.value === value;
              const isHighlighted = i === highlightIndex;
              return (
                <li key={option.value} data-option>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    className={[
                      'w-full flex items-center gap-2 px-3 py-[6px] text-[13px] text-left transition-colors duration-75',
                      isHighlighted
                        ? 'bg-[#5e6ad2]/12 text-[#e2e2ea]'
                        : isSelected
                          ? 'text-[#e2e2ea]'
                          : 'text-[#a0a3bd] hover:bg-[#232340]',
                    ].join(' ')}
                  >
                    <EmojiIcon icon={option.icon} />
                    <span className="truncate flex-1">{option.label}</span>
                    {option.secondary && (
                      <span className="text-[#4a4d64] text-xs shrink-0">{option.secondary}</span>
                    )}
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-[#5e6ad2] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
}
