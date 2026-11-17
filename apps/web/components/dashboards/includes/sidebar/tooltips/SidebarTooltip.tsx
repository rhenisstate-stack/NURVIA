'use client';

import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  x: number;
  y: number;
  position?: 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  x,
  y,
  position = 'right',
}) => {
  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        top: y,
        left: x,
        transform:
          position === 'left'
            ? 'translate(-100%, -50%) translateX(-8px)'
            : 'translate(0, -50%) translateX(8px)',
      }}
    >
      <div className="whitespace-nowrap rounded bg-[#142B4A] px-3 py-1 text-sm text-white shadow-lg">
        {children}
      </div>
    </div>
  );
};
