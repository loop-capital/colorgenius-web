'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search by hashtag, brand, or stylist...' }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`relative flex items-center bg-white/[0.03] border rounded-xl px-3 py-2 transition-all ${
        focused ? 'border-[#9333EA]/30 ring-1 ring-[#9333EA]/20' : 'border-white/[0.06]'
      }`}
    >
      <Search className="w-4 h-4 text-[#52525B] flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#F5F5F7] placeholder-[#52525B] px-2"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          className="w-5 h-5 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-[#71717A] transition-colors flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
