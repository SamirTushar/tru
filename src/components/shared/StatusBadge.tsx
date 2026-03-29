import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
  return (
    <span className={cn('inline-flex px-2 py-px rounded-full text-[10px] font-semibold', colors.bg, colors.text)}>
      {status}
    </span>
  );
}
