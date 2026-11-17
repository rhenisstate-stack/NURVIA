'use client';

import { X } from 'lucide-react';

export function ImageViewer({
  src,
  alt = 'Clinical exhibit',
  onClose,
}: {
  src: string | null;
  alt?: string;
  onClose: () => void;
}) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="absolute right-3 top-3 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
        >
          <X className="h-4 w-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[85vh] w-auto rounded-xl object-contain" />
      </div>
    </div>
  );
}
