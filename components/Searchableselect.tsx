"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  name: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

export default function SearchableSelect({
  name,
  options,
  placeholder = "Search or select…",
  required,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Option | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        // If user typed but didn't pick, revert input to selected label
        setQuery(selected?.label ?? "");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selected]);

  const handleSelect = (option: Option) => {
    setSelected(option);
    setQuery(option.label);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    if (e.target.value === "") setSelected(null);
  };

  const handleFocus = () => {
    setOpen(true);
    // Clear display text so user can type fresh
    if (selected) setQuery("");
  };

  const inputClass =
    "w-full h-[42px] rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-[13.5px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-indigo-500 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500/10";

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input carries the actual value for form submission */}
      <input
        type="hidden"
        name={name}
        value={selected?.value ?? ""}
        required={required}
      />

      {/* Visible search input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass}
      />

      {/* Chevron / clear icon */}
      <button
        type="button"
        tabIndex={-1}
        onClick={() => {
          if (selected) {
            setSelected(null);
            setQuery("");
            inputRef.current?.focus();
          } else {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }
        }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
      >
        {selected ? (
          // X icon
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          // Chevron icon
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-auto max-h-56 py-1">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-[13px] text-slate-400 text-center">
              No results found
            </li>
          ) : (
            filtered.map((option) => (
              <li
                key={option.value}
                onMouseDown={() => handleSelect(option)}
                className={`px-4 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors
                  ${
                    selected?.value === option.value
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
