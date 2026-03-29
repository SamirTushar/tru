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
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-[11px] leading-relaxed text-gray-100 bg-gray-800 dark:bg-gray-700 rounded-lg max-w-[280px] z-50 pointer-events-none shadow-lg" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
        </span>
      )}
    </span>
  );
}
