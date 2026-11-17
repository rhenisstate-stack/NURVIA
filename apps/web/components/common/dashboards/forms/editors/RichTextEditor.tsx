'use client';

import React from 'react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write clinical rationale or study notes...',
  disabled = false,
  className = '',
}: RichTextEditorProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        className="nurvia-editor-prose w-full resize-y rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
      />
    </div>
  );
}

export default RichTextEditor;
