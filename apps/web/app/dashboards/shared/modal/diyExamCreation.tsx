'use client';

import { useState } from 'react';
import { X, PlusCircle, Loader2 } from 'lucide-react';

interface DiyExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName?: string;
  onCreated?: (examId: string) => void;
  programs?: unknown[];
  targetName?: string;
  targetPanel?: string;
  targetSegment?: string;
  initialCourseGuid?: string | null;
}

export function DiyExamCreationModal({
  isOpen,
  onClose,
  programName,
  onCreated,
  targetName,
  targetSegment,
}: DiyExamModalProps) {
  const resolvedProgramName = programName ?? targetName ?? targetSegment ?? 'Nursing';
  const [title, setTitle] = useState(`${resolvedProgramName} Custom Practice`);
  const [questionCount, setQuestionCount] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/exams/diy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          questionCount,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || 'Unable to create custom practice exam.');
      } else {
        const createdId = String(json?.data?.guidId ?? json?.data?.id ?? '');
        onCreated?.(createdId);
        onClose();
      }
    } catch {
      setError('Network error while creating custom exam.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#0D9488]" />
            <h2 className="text-lg font-bold text-[#142B4A]">Create Custom Practice Exam</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Exam Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0D9488] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Question Count
            </label>
            <input
              type="number"
              min={5}
              max={150}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0D9488] focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DiyExamCreationModal;
