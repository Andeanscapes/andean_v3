'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  /** Full Tailwind class string for the trigger button. */
  triggerClassName?: string;
  /** Full Tailwind class string for the options panel. */
  panelClassName?: string;
  /** Full Tailwind class string for each option row. */
  optionClassName?: string;
  /** Full Tailwind class string for the hover state of each option row. */
  optionHoverClassName?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Select({
  id,
  options,
  value,
  onChange,
  className = '',
  triggerClassName,
  panelClassName,
  optionClassName,
  optionHoverClassName,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const li = listRef.current?.children[focusedIndex] as HTMLElement | undefined;
    li?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex, isOpen]);

  function open() {
    if (disabled) return;
    setFocusedIndex(options.findIndex((o) => o.value === value));
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function select(option: SelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    close();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    const enabledIndexes = options
      .map((o, i) => (!o.disabled ? i : null))
      .filter((i): i is number => i !== null);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = enabledIndexes.find((i) => i > focusedIndex) ?? enabledIndexes[0];
        setFocusedIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = [...enabledIndexes].reverse().find((i) => i < focusedIndex) ?? enabledIndexes[enabledIndexes.length - 1];
        setFocusedIndex(prev);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (focusedIndex >= 0) select(options[focusedIndex]);
        break;
      }
      case 'Escape':
      case 'Tab': {
        close();
        break;
      }
      default: {
        // Type-ahead: jump to first option starting with the key
        const char = e.key.toLowerCase();
        const match = enabledIndexes.find((i) => options[i].label.toLowerCase().startsWith(char));
        if (match !== undefined) setFocusedIndex(match);
      }
    }
  }

  const defaultTrigger =
    'flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-base-content transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F08F]/60 disabled:cursor-not-allowed disabled:opacity-50';

  const defaultPanel =
    'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/15 bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.45)]';

  const defaultOption =
    'flex cursor-pointer select-none items-center px-3 py-2.5 text-sm text-base-content/90 transition-colors';

  const defaultOptionHover = 'hover:bg-white/10 hover:text-base-content';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-activedescendant={focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClassName ?? defaultTrigger}
      >
        <span className="truncate">{selectedOption?.label ?? ''}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className={`${panelClassName ?? defaultPanel} max-h-60 overflow-y-auto focus:outline-none`}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;

            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => select(option)}
                className={[
                  optionClassName ?? defaultOption,
                  !option.disabled ? (optionHoverClassName ?? defaultOptionHover) : 'cursor-not-allowed opacity-40',
                  isFocused && !option.disabled ? 'bg-white/10 text-base-content' : '',
                  isSelected ? 'font-semibold text-[#00F08F]' : '',
                  index === 0 ? '[&]:border-t-0' : '',
                ].join(' ')}
              >
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="mr-2 h-3.5 w-3.5 shrink-0 text-[#00F08F]">
                    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                )}
                {!isSelected && <span className="mr-2 h-3.5 w-3.5 shrink-0" />}
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
