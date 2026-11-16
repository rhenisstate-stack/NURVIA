"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PHONE_COUNTRY,
  filterCountries,
  getCountryOptions,
  type CountryCode,
  type CountryOption,
} from "@/lib/phone";

export interface PhoneCountryInputProps {
  id?: string;
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: string | null;
  disabled?: boolean;
  required?: boolean;
}

export function PhoneCountryInput({
  id = "phone",
  country,
  onCountryChange,
  value,
  onChange,
  onBlur,
  error,
  hint,
  disabled = false,
  required = true,
}: PhoneCountryInputProps) {
  const allCountries = React.useMemo(() => getCountryOptions(), []);
  const selectedOption = React.useMemo<CountryOption>(
    () => allCountries.find((c) => c.code === country) ?? allCountries.find((c) => c.code === DEFAULT_PHONE_COUNTRY) ?? allCountries[0],
    [allCountries, country]
  );

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const filteredCountries = React.useMemo(
    () => filterCountries(search, allCountries),
    [search, allCountries]
  );

  React.useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  const selectCountry = React.useCallback(
    (option: CountryOption) => {
      onCountryChange(option.code);
      setOpen(false);
      setSearch("");
      triggerRef.current?.focus();
    },
    [onCountryChange]
  );

  const handleDropdownKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (filteredCountries.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredCountries.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredCountries.length) % filteredCountries.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filteredCountries.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = filteredCountries[activeIndex];
      if (target) selectCountry(target);
    }
  };

  React.useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div
        className={cn(
          "flex h-11 w-full items-stretch rounded-lg border bg-background transition-colors focus-within:ring-2 focus-within:ring-brand-teal",
          error ? "border-rose-600 dark:border-rose-500" : "border-border"
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-label={`Country dialing code: ${selectedOption.name} (${selectedOption.callingCode})`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex shrink-0 items-center gap-1.5 rounded-l-lg border-r border-border bg-surface-muted/60 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal disabled:opacity-50"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {selectedOption.flag}
          </span>
          <span className="tabular-nums text-xs font-semibold sm:text-sm">
            {selectedOption.callingCode}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-foreground-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>

        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          maxLength={24}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={selectedOption.code === "KE" ? "0712 345 678" : "Phone number"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent px-3 text-sm text-foreground placeholder:text-foreground-muted/70 focus-visible:outline-none disabled:opacity-50"
        />
      </div>

      {open && (
        <div
          onKeyDown={handleDropdownKeyDown}
          className="absolute left-0 top-[48px] z-50 w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg sm:w-80"
        >
          <div className="flex items-center gap-2 border-b border-border bg-background/60 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search country or +code..."
              aria-label="Search country or dialing code"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none"
            />
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label="Country dialing codes"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredCountries.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-foreground-muted">
                No matching countries found.
              </li>
            ) : (
              filteredCountries.map((option, idx) => {
                const isSelected = option.code === selectedOption.code;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={option.code}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectCountry(option)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                      isActive ? "bg-brand-teal/10 text-foreground" : "text-foreground-secondary hover:bg-surface-muted",
                      isSelected && "font-semibold text-brand-teal"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-base leading-none">
                        {option.flag}
                      </span>
                      <span className="truncate">{option.name}</span>
                      <span className="shrink-0 text-xs text-foreground-muted">({option.code})</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-xs font-medium">
                      {option.callingCode}
                      {isSelected && <Check className="h-3.5 w-3.5 text-brand-teal" aria-hidden="true" />}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
