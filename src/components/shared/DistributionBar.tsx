import { ERP_COLORS } from '@/lib/constants';

interface BarSegment {
  label: string;
  value: number;
  color?: string;
}

interface DistributionBarProps {
  segments: BarSegment[];
  height?: string;
}

export function DistributionBar({ segments, height = 'h-6' }: DistributionBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div className={`flex w-full rounded-full overflow-hidden ${height}`}>
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (pct < 0.5) return null;
        const color = seg.color ?? ERP_COLORS[seg.label] ?? '#6B7280';
        return (
          <div
            key={i}
            title={`${seg.label}: ${seg.value} (${pct.toFixed(1)}%)`}
            className="flex items-center justify-center text-white text-[10px] font-medium transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: color }}
          >
            {pct >= 8 ? `${seg.label} ${seg.value}` : ''}
          </div>
        );
      })}
    </div>
  );
}
