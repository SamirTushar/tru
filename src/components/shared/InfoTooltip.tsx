'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-[9px] font-medium flex items-center justify-center cursor-help leading-none">
        i
      </span>
      {show && (
        <span className="absolute bottom-full left-0 mb-2 px-3 py-1.5 text-[11px] leading-snug text-gray-100 bg-gray-800 dark:bg-gray-700 rounded-md z-50 pointer-events-none shadow-lg" style={{ width: 'max-content', maxWidth: '320px' }}>
          {text}
        </span>
      )}
    </span>
  );
}
