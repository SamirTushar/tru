import { cn } from '@/lib/utils';
import { InfoTooltip } from './InfoTooltip';

interface MetricCardProps {
  value: string | number;
  label: string;
  subtitle?: React.ReactNode;
  valueColor?: string;
  className?: string;
  tooltip?: string;
}

export function MetricCard({ value, label, subtitle, valueColor, className, tooltip }: MetricCardProps) {
  return (
    <div className={cn('px-2 py-3', className)}>
      <p className={cn('text-[30px] leading-none font-bold tracking-tight text-gray-900 dark:text-gray-50', valueColor)}>
        {value}
      </p>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </p>
      {subtitle && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
