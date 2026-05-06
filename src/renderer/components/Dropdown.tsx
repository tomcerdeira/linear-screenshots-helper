import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { shortcodeToEmoji } from '../utils/emoji';

export interface DropdownOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: string | null;
  readonly secondary?: string;
  readonly avatarUrl?: string | null;
  readonly renderIcon?: React.ReactNode;
  readonly group?: string;
}

interface DropdownProps {
  readonly options: DropdownOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly searchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly renderTrigger?: (selected: DropdownOption | undefined, isOpen: boolean) => React.ReactNode;
  readonly panelMinWidth?: number;
}

interface PanelPosition {
  readonly top?: number;
  readonly bottom?: number;
  readonly left: number;
  readonly width: number;
  readonly maxHeight: number;
  readonly placement: 'top' | 'bottom';
  readonly originX: 'left' | 'right' | 'center';
}

const VIEWPORT_MARGIN = 8;
const PANEL_GAP = 4;
const PANEL_MIN_HEIGHT = 120;

function EmojiIcon({ icon }: { readonly icon: string | null | undefined }) {
  const emoji = shortcodeToEmoji(icon);
  if (!emoji) return null;
  return (
    <span className="inline-flex items-center justify-center shrink-0 w-[22px] h-[22px] text-[16px] leading-none overflow-hidden">
      {emoji}
    </span>
  );
}

function Avatar({ url, name }: { readonly url?: string | null; readonly name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="shrink-0 w-[20px] h-[20px] rounded-full object-cover"
      />
    );
  }

  return (
    <span className="shrink-0 w-[20px] h-[20px] rounded-full bg-border-subtle flex items-center justify-center text-[9px] font-medium text-content-secondary">
      {initials}
    </span>
  );
}

function OptionIcon({ option }: { readonly option: DropdownOption }) {
  if (option.renderIcon) {
    return <span className="shrink-0 flex items-center justify-center w-[20px] h-[20px]">{option.renderIcon}</span>;
  }
  if (option.avatarUrl !== undefined) {
    return <Avatar url={option.avatarUrl} name={option.label} />;
  }
  return <EmojiIcon icon={option.icon} />;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  renderTrigger,
  panelMinWidth,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  // Refs for document-level keydown handler (avoids stale closures)
  const highlightIndexRef = useRef(highlightIndex);
  highlightIndexRef.current = highlightIndex;

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.secondary?.toLowerCase().includes(search.toLowerCase()) ?? false),
      )
    : options;

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  // Compute position relative to the trigger button, clamping to viewport
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const desiredWidth = Math.max(rect.width, panelMinWidth ?? 0);
    const width = Math.min(desiredWidth, viewportW - VIEWPORT_MARGIN * 2);

    // Horizontal: prefer left-aligned to trigger; if overflows right, right-align to trigger; clamp.
    let left = rect.left;
    let originX: 'left' | 'right' | 'center' = 'left';
    if (left + width > viewportW - VIEWPORT_MARGIN) {
      left = rect.right - width;
      originX = 'right';
    }
    if (left < VIEWPORT_MARGIN) {
      left = VIEWPORT_MARGIN;
      originX = 'center';
    }

    // Vertical: prefer above (current default); flip below if not enough room.
    const spaceAbove = rect.top - VIEWPORT_MARGIN - PANEL_GAP;
    const spaceBelow = viewportH - rect.bottom - VIEWPORT_MARGIN - PANEL_GAP;
    const placement: 'top' | 'bottom' =
      spaceAbove >= PANEL_MIN_HEIGHT || spaceAbove >= spaceBelow ? 'top' : 'bottom';
    const maxHeight = placement === 'top' ? spaceAbove : spaceBelow;

    setPosition(
      placement === 'top'
        ? { bottom: viewportH - rect.top + PANEL_GAP, left, width, maxHeight, placement, originX }
        : { top: rect.bottom + PANEL_GAP, left, width, maxHeight, placement, originX },
    );
  }, [panelMinWidth]);

  // Close on outside click; handle Escape and arrow/enter navigation at document level
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
        e.stopPropagation();
        e.stopImmediatePropagation();
        setOpen(false);
        setSearch('');
        buttonRef.current?.focus();
        return;
      }

      // Handle arrow/enter navigation at the document level
      // so it works regardless of what element has focus
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setHighlightIndex((prev) => (prev < filteredRef.current.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filteredRef.current.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const idx = highlightIndexRef.current;
        if (idx >= 0 && idx < filteredRef.current.length) {
          handleSelect(filteredRef.current[idx].value);
        }
      }
    }

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  // Position + focus on open
  useEffect(() => {
    if (!open) {
      setHighlightIndex(-1);
      return;
    }
    updatePosition();

    // Pre-highlight the currently selected item
    const selectedIdx = filtered.findIndex((o) => o.value === value);
    if (selectedIdx >= 0) setHighlightIndex(selectedIdx);

    requestAnimationFrame(() => {
      if (searchable && searchRef.current) {
        searchRef.current.focus();
      } else if (panelRef.current) {
        panelRef.current.focus();
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

  function handleButtonKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
    }
  }

  const defaultTrigger = (
    <span className={[
      'w-full flex items-center justify-between gap-2 px-3 py-[7px] rounded-md text-sm text-left transition-all duration-100',
      'bg-surface-hover border',
      open
        ? 'border-linear-brand/70 ring-1 ring-linear-brand/30'
        : 'border-border-subtle hover:border-border-hover',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ')}>
      {selected ? (
        <span className="flex items-center gap-2 text-content truncate min-w-0">
          <EmojiIcon icon={selected.icon} />
          <span className="truncate">{selected.label}</span>
          {selected.secondary && (
            <span className="text-content-muted text-xs shrink-0">{selected.secondary}</span>
          )}
        </span>
      ) : (
        <span className="text-content-muted">{disabled ? 'Loading...' : placeholder}</span>
      )}
      <ChevronDown className={`w-3.5 h-3.5 text-content-muted shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
    </span>
  );

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
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={renderTrigger ? 'inline-flex focus:outline-none focus-visible:ring-1 focus-visible:ring-linear-brand rounded-full' : 'w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-linear-brand rounded-md'}
      >
        {renderTrigger ? renderTrigger(selected, open) : defaultTrigger}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && position && (
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          initial={{ opacity: 0, y: position.placement === 'top' ? -4 : 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.placement === 'top' ? -4 : 4, scale: 0.97 }}
          transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            ...(position.placement === 'top'
              ? { bottom: position.bottom }
              : { top: position.top }),
            left: position.left,
            width: position.width,
            maxHeight: position.maxHeight,
            zIndex: 9999,
            transformOrigin: `${position.placement === 'top' ? 'bottom' : 'top'} ${position.originX}`,
            display: 'flex',
            flexDirection: 'column',
          }}
          className="rounded-lg bg-surface-raised border border-border-subtle shadow-2xl shadow-black/50 overflow-hidden"
        >
          {searchable && (
            <div className="px-2 pt-2 pb-1.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface-hover border border-border-subtle">
                <Search className="w-3.5 h-3.5 text-content-muted shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent border-none text-[13px] text-content placeholder:text-content-muted focus:outline-none p-0 m-0 ring-0 focus:ring-0"
                />
              </div>
            </div>
          )}

          <ul
            ref={listRef}
            role="listbox"
            className="flex-1 min-h-0 max-h-[240px] overflow-y-auto py-1 px-1"
          >
            {filtered.length === 0 && (
              <li className="px-2 py-4 text-[13px] text-content-muted text-center">
                No results found
              </li>
            )}
            {filtered.map((option, i) => {
              const isSelected = option.value === value;
              const isHighlighted = i === highlightIndex;
              const prevGroup = i > 0 ? filtered[i - 1].group : undefined;
              const showGroup = option.group && option.group !== prevGroup;

              return (
                <React.Fragment key={option.value}>
                  {showGroup && (
                    <li className="px-2.5 pt-2 pb-1 text-[11px] text-content-muted font-medium">
                      {option.group}
                    </li>
                  )}
                  <li data-option>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      title={option.label}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHighlightIndex(i)}
                      className={[
                        'w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-left rounded-md transition-colors duration-75',
                        isHighlighted || isSelected
                          ? 'bg-surface-hover text-content'
                          : 'text-content-secondary hover:bg-surface-hover hover:text-content',
                      ].join(' ')}
                    >
                      <OptionIcon option={option} />
                      <span className="truncate flex-1">{option.label}</span>
                      {option.secondary && (
                        <span className="text-content-muted text-xs shrink-0">{option.secondary}</span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-linear-brand shrink-0" />
                      )}
                    </button>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
