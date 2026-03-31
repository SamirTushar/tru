'use client';

import { useApp } from '@/context/AppContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts';

export function ExecutiveImpact() {
  const { activeMaster } = useApp();

  return (
    <div className="space-y-7">
      <HeroMetrics activeMaster={activeMaster} />

      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl">
        <ImpactTable activeMaster={activeMaster} />
      </div>
    </div>
  );
}

/* ── Hero Metrics ── */

function HeroMetrics({ activeMaster }: { activeMaster: string }) {
  if (activeMaster === 'all') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard value="1,539 → 1,322" label="Records" subtitle={<ReductionBadge pct="14.1%" />} tooltip="Combined customer + product records before and after deduplication" />
        <MetricCard value="688 → 488" label="Customers" subtitle={<ReductionBadge pct="29.1%" />} tooltip="Customer entity count before and after deduplication" />
        <MetricCard value="851 → 834" label="Products" subtitle={<ReductionBadge pct="2.0%" />} tooltip="Product record count before and after deduplication" />
        <MetricCard value="28 → 12" label="Channels" subtitle={<ReductionBadge pct="57%" />} tooltip="Sales channel count before and after standardization" />
      </div>
    );
  }
  if (activeMaster === 'customer') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <MetricCard value="688" label="Source Records" subtitle="From 4 ERPs" tooltip="Total raw customer records ingested from all ERP systems" />
        <MetricCard value="488" label="Golden Records" subtitle="Unique entities" tooltip="Unique entities after deduplication — one record per real-world customer" />
        <MetricCard value="29.1%" label="Dedup Rate" subtitle="200 duplicates resolved" valueColor="text-emerald-600 dark:text-emerald-400" tooltip="Percentage of source records identified as duplicates and merged" />
        <MetricCard value="179" label="Exact Matches" subtitle="Confidence = 1.00" tooltip="Record pairs with identical core name and country after cleaning pipeline" />
        <MetricCard value="21" label="Fuzzy Matches" subtitle="Confidence >= 0.85" tooltip="Record pairs matched by composite similarity score (>= 0.85 threshold)" />
      </div>
    );
  }
  if (activeMaster === 'product') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <MetricCard value="851" label="Source Records" subtitle="From 4 ERPs" tooltip="Total raw product records ingested from all ERP systems" />
        <MetricCard value="834" label="Golden Records" subtitle="Unique products" tooltip="Unique products after deduplication" />
        <MetricCard value="2.0%" label="Dedup Rate" subtitle="17 duplicates resolved" valueColor="text-emerald-600 dark:text-emerald-400" tooltip="Percentage of source records identified as duplicates and merged" />
        <MetricCard value="17" label="Within-Source Dupes" subtitle="Same Product ID" tooltip="Duplicate records found within the same ERP system" />
        <MetricCard value="6" label="Cross-Source Matches" subtitle="Infor <> SAP" tooltip="Product matches found across different ERP systems" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
      <MetricCard value="4" label="Business Units" subtitle="CBD, BMB, Nabil, Atyab" tooltip="Distinct business units mapped across the organisation" />
      <MetricCard value="4" label="ERPs Mapped" subtitle="SAP, Oracle, Epicor, Infor" tooltip="Enterprise Resource Planning systems connected and harmonized" />
      <MetricCard value="6" label="Divisions" subtitle="Under BMB" tooltip="Sub-divisions within the BMB business unit" />
      <MetricCard value="3" label="Hierarchy Levels" subtitle="Group > BU > Division" tooltip="Depth of the organisational hierarchy tree" />
      <MetricCard value="10" label="GOIDs Assigned" subtitle="Global Org IDs" tooltip="Global Organisation IDs — unique identifiers for each org entity" />
    </div>
  );
}

function ReductionBadge({ pct }: { pct: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
      <ArrowDown size={11} /> {pct} Reduction
    </span>
  );
}

/* ── Single Impact Table (replaces old Harmonization + Before & After tabs) ── */

function ImpactTable({ activeMaster }: { activeMaster: string }) {
  if (activeMaster === 'all') {
    const rows = [
      { metric: 'Total Source Records', before: '1,539', after: '1,322', change: '14.1% reduction', tip: 'Combined customer + product records across all ERPs' },
      { metric: 'Customer Records', before: '688', after: '488', change: '29.1% reduction', tip: 'Customer master records before and after dedup' },
      { metric: 'Product Records', before: '851', after: '834', change: '2.0% reduction', tip: 'Product master records before and after dedup' },
      { metric: 'Categories', before: '50', after: '32', change: '36% reduction', tip: 'Product categories unified via enterprise hierarchy' },
      { metric: 'Brands', before: '34', after: '29', change: '15% reduction', tip: 'Brand variants normalized via dictionary mapping' },
      { metric: 'Sales Channels', before: '28', after: '12', change: '57% reduction', tip: 'Sales channels consolidated under standard taxonomy' },
      { metric: 'Cross-ERP Linkages', before: '0', after: '13', change: 'Fully linked', tip: 'Entities discovered across multiple ERP systems (7 customer + 6 product)' },
      { metric: 'Quality Issues', before: '0', after: '53', change: '53 flagged', tip: 'Data quality issues identified for remediation (30 customer + 23 product)' },
      { metric: 'Country Standardization', before: '12 formats', after: '12 (ISO)', change: 'Normalized', tip: 'Raw country formats normalized to ISO standard' },
    ];

    const chartData = [
      { metric: 'Records', Before: 1539, After: 1322 },
      { metric: 'Customers', Before: 688, After: 488 },
      { metric: 'Products', Before: 851, After: 834 },
      { metric: 'Categories', Before: 50, After: 32 },
      { metric: 'Brands', Before: 34, After: 29 },
      { metric: 'Channels', Before: 28, After: 12 },
    ];

    return (
      <>
        <div className="px-6 pt-4 pb-3">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={2} barCategoryGap="30%">
              <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} width={35} />
              <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#9CA3AF', paddingTop: 4 }} />
              <Bar dataKey="Before" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="After" fill="#F97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <MetricTable rows={rows} />
      </>
    );
  }

  if (activeMaster === 'customer') {
    const rows = [
      { metric: 'Customer Names', before: '688 raw names', after: '488 golden names', change: '29.1% reduction', tip: 'Customer entities consolidated after deduplication' },
      { metric: 'Duplicate Clusters', before: '0 identified', after: '200 resolved', change: '100%', tip: 'Duplicate record groups identified and merged' },
      { metric: 'Cross-ERP Entities', before: '0 linked', after: '7 clusters', change: 'New', tip: 'Customer entities found across multiple ERP systems' },
      { metric: 'Country Formats', before: '12 variants', after: '12 ISO standard', change: 'Normalized', tip: 'Raw country names standardized to ISO codes' },
    ];
    return <MetricTable rows={rows} />;
  }

  if (activeMaster === 'product') {
    const rows = [
      { metric: 'Brand Variants', before: '40+ raw variants', after: '29 standardized', change: '15% reduction', tip: 'Brand names normalized via dictionary mapping' },
      { metric: 'Product Categories', before: '50 source codes', after: '32 enterprise hierarchy', change: '36% reduction', tip: 'Source category codes mapped to standard hierarchy' },
      { metric: 'Within-Source Dupes', before: '17 undetected', after: '0 remaining', change: '100%', tip: 'Duplicate products within same ERP identified and removed' },
      { metric: 'Cross-Source Links', before: '0 identified', after: '6 Infor↔SAP matches', change: 'New', tip: 'Product matches found across different ERP systems' },
    ];
    return <MetricTable rows={rows} />;
  }

  // Organisation
  const rows = [
    { dim: 'Parent Group', count: '1', detail: 'Agthia Group' },
    { dim: 'Business Units', count: '4', detail: 'CBD (SAP), BMB (Epicor), Nabil (Oracle), Atyab (Infor)' },
    { dim: 'Divisions', count: '6', detail: 'BMB01–BMB10' },
    { dim: 'GOIDs Assigned', count: '10', detail: 'GOID-G-001 through GOID-DV-006' },
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <TH align="left">Element</TH>
          <TH align="right">Count</TH>
          <TH align="left">Details</TH>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <TR key={i}>
            <TD className="font-medium text-gray-900 dark:text-gray-100">{r.dim}</TD>
            <TD align="right">{r.count}</TD>
            <TD className="text-gray-500">{r.detail}</TD>
          </TR>
        ))}
      </tbody>
    </table>
  );
}

/* ── Reusable Metric Table ── */

function MetricTable({ rows }: { rows: { metric: string; before: string; after: string; change: string; tip: string }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <TH align="left">
            <span className="inline-flex items-center gap-1">Metric <InfoTooltip text="Key performance indicator tracked before and after MDM processing" /></span>
          </TH>
          <TH align="right">Before MDM</TH>
          <TH align="right">After MDM</TH>
          <TH align="right">Change</TH>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <TR key={i}>
            <TD className="font-medium text-gray-900 dark:text-gray-100">
              <span className="inline-flex items-center gap-1">
                {row.metric}
                {row.tip && <InfoTooltip text={row.tip} />}
              </span>
            </TD>
            <TD align="right" className="text-gray-500">{row.before}</TD>
            <TD align="right" className="font-medium text-gray-900 dark:text-gray-100">{row.after}</TD>
            <TD align="right" className="text-emerald-600 dark:text-emerald-400 font-medium">{row.change}</TD>
          </TR>
        ))}
      </tbody>
    </table>
  );
}

/* ── Shared table primitives ── */

function TH({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function TR({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
      {children}
    </tr>
  );
}

function TD({ children, align = 'left', className = '' }: { children: React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  return (
    <td className={`px-6 py-4 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  );
}
