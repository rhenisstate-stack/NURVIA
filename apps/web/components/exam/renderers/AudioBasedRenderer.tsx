'use client';

import * as React from 'react';
import type { QuestionRendererProps } from './types';
import { SingleChoiceRenderer } from './SingleChoiceRenderer';

export const AudioBasedRenderer: React.FC<QuestionRendererProps> = (props) => {
  const audioExhibit = props.question.exhibits?.find((ex) =>
    String(ex.type).toLowerCase().includes('audio')
  );

  return (
    <div className="space-y-4">
      {audioExhibit?.content && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#142B4A]">
            {audioExhibit.title || 'Clinical Audio Exhibit'}
          </p>
          <audio controls className="w-full" src={audioExhibit.content}>
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
      <SingleChoiceRenderer {...props} />
    </div>
  );
};
