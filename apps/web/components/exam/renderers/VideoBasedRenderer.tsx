'use client';

import * as React from 'react';
import type { QuestionRendererProps } from './types';
import { SingleChoiceRenderer } from './SingleChoiceRenderer';

export const VideoBasedRenderer: React.FC<QuestionRendererProps> = (props) => {
  const videoExhibit = props.question.exhibits?.find((ex) =>
    String(ex.type).toLowerCase().includes('video')
  );

  return (
    <div className="space-y-4">
      {videoExhibit?.content && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#142B4A]">
            {videoExhibit.title || 'Clinical Video Exhibit'}
          </p>
          <video controls className="max-h-80 w-full rounded-lg bg-black" src={videoExhibit.content}>
            Your browser does not support video playback.
          </video>
        </div>
      )}
      <SingleChoiceRenderer {...props} />
    </div>
  );
};
