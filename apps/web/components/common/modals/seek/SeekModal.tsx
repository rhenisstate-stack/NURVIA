'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';

export interface SeekItem {
  guidId: string;
  name: string;
  description?: string;
  scope?: string;
  examGuidId?: string;
}

interface SeekModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  defaultScope?: string;
}

export function SeekModal({ isOpen: isOpenProp, open, onClose, defaultScope = 'exam' }: SeekModalProps) {
  const isOpen = Boolean(isOpenProp ?? open);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(defaultScope);
  const [items, setItems] = useState<SeekItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const runSearch = useCallback(async (q: string, s: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setItems([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: trimmed, scope: s, perPage: '15' });
      const res = await fetch(`/api/seek?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || 'Search failed.');
        setItems([]);
      } else {
        const list = data?.data?.items ?? data?.items ?? [];
        setItems(Array.isArray(list) ? list : []);
      }
    } catch {
      setError('Unable to reach search service.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      void runSearch(query, scope);
    }, 250);
    return () => clearTimeout(timer);
  }, [isOpen, query, scope, runSearch]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-start justify-center bg-slate-950/60 p-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search NURVIA"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 bg-[#142B4A] px-4 py-3 text-white">
          <Search className="h-5 w-5 text-[#0D9488]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nursing exams, subjects, or questions..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-300 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs">
          {['program', 'course', 'subject', 'exam', 'question'].map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setScope(sc)}
              className={`rounded-full px-3 py-1 font-semibold capitalize transition-colors ${
                scope === sc
                  ? 'bg-[#0D9488] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0D9488]" />
              Searching...
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && query.trim() && items.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No matching {scope} records found for &ldquo;{query}&rdquo;.
            </p>
          )}

          {!loading && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.guidId}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/exams?q=${encodeURIComponent(item.name)}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-[#0D9488] hover:bg-teal-50/40"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-sm font-semibold text-[#142B4A]">{item.name}</p>
                      {item.description && (
                        <p className="truncate text-xs text-slate-500">{item.description}</p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[#0D9488]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SeekModal;
