import { ERP_COLORS } from '@/lib/constants';

interface ERPBadgeProps {
  system: string;
}

export function ERPBadge({ system }: ERPBadgeProps) {
  const color = ERP_COLORS[system] ?? '#6B7280';
  return (
    <span
      className="inline-flex px-2 py-px rounded-full text-[10px] font-semibold text-white leading-relaxed"
      style={{ backgroundColor: color }}
    >
      {system}
    </span>
  );
}
