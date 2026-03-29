import { cn } from '@/lib/utils';
import { ACTION_COLORS } from '@/lib/constants';

interface ActionBadgeProps {
  action: string;
  count?: number;
}

export function ActionBadge({ action, count }: ActionBadgeProps) {
  const colors = ACTION_COLORS[action] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-px rounded-full text-[10px] font-semibold', colors.bg, colors.text)}>
      {action}
      {count !== undefined && <span className="font-bold">{count}</span>}
    </span>
  );
}
