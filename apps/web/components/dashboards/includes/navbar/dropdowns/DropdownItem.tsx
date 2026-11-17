'use client';

import React from 'react';
import Link from 'next/link';

interface DropdownItemProps {
  tag?: 'a' | 'button';
  href?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = 'button',
  href,
  onClick,
  onItemClick,
  baseClassName = 'block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-[#142B4A]',
  className = '',
  children,
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (tag === 'button') {
      event.preventDefault();
    }
    onClick?.();
    onItemClick?.();
  };

  if (tag === 'a' && href) {
    return (
      <Link href={href} className={combinedClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={combinedClasses}>
      {children}
    </button>
  );
};
