'use client';

import { QuestionRendererRegistry } from '@/components/exam/renderers/QuestionRendererRegistry';
import type { RendererQuestion } from '@/components/exam/renderers/types';

export function QuestionTypesDispatcher({
  question,
  value,
  onChange,
  disabled = false,
}: {
  question: RendererQuestion;
  value?: string | null;
  onChange?: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <QuestionRendererRegistry
      question={question}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
