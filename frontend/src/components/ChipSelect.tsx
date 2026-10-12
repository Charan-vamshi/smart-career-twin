import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

interface ChipSelectProps {
  label: string;
  selected: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxItems?: number;
}

export const ChipSelect = ({ label, selected, options, onChange, placeholder = 'Search...', maxItems }: ChipSelectProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o)
  ).slice(0, 20);

  const addItem = useCallback((item: string) => {
    if (maxItems && selected.length >= maxItems) return;
    onChange([...selected, item]);
    setQuery('');
  }, [selected, onChange, maxItems]);

  const removeItem = useCallback((item: string) => {
    onChange(selected.filter((s) => s !== item));
  }, [selected, onChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2.5" ref={containerRef}>
      <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: 'rgba(229, 193, 88, 0.12)',
                border: '1px solid rgba(229, 193, 88, 0.35)',
                color: '#f3e5ab',
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
                style={{ lineHeight: 1 }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-text"
          style={{
            background: 'rgba(14, 14, 17, 0.85)',
            border: `1px solid ${open ? 'rgba(229, 193, 88, 0.55)' : 'rgba(255, 255, 255, 0.09)'}`,
            boxShadow: open ? '0 0 0 3px rgba(229, 193, 88, 0.10)' : 'none',
            transition: 'all 0.2s ease',
          }}
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 shrink-0 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none border-none shadow-none"
            style={{ color: '#fafafa', padding: 0, boxShadow: 'none', background: 'transparent' }}
          />
          <ChevronDown
            className="w-4 h-4 shrink-0 text-zinc-500"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </div>

        {/* Dropdown */}
        {open && filtered.length > 0 && (
          <div
            className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
            {filtered.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => { addItem(item); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm transition-all cursor-pointer"
                style={{ color: '#d4d4d8' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(229, 193, 88, 0.12)';
                  (e.currentTarget as HTMLElement).style.color = '#fafafa';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#d4d4d8';
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        {open && filtered.length === 0 && query && (
          <div
            className="absolute z-50 w-full mt-1.5 rounded-xl px-4 py-3 text-sm text-zinc-500"
            style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            No matches found
          </div>
        )}
      </div>
    </div>
  );
};
