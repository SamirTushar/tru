'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { TabSwitcher } from '@/components/shared/TabSwitcher';
import customerData from '@/data/customer.json';
import productData from '@/data/product.json';
import sharedData from '@/data/shared.json';
import { ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts';

export function ExecutiveImpact() {
  const { activeMaster } = useApp();
  const [tab, setTab] = useState<'harmonization' | 'beforeAfter'>('harmonization');

  return (
    <div className="space-y-7">
      <HeroMetrics activeMaster={activeMaster} />

      <TabSwitcher
        tabs={[
          { id: 'harmonization', label: 'Harmonization Impact' },
          { id: 'beforeAfter', label: 'Before & After' },
        ]}
        activeTab={tab}
        onTabChange={(id) => setTab(id as 'harmonization' | 'beforeAfter')}
      />

      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl">
        {tab === 'harmonization' && <HarmonizationTab activeMaster={activeMaster} />}
        {tab === 'beforeAfter' && <BeforeAfterTab activeMaster={activeMaster} />}
      </div>
    </div>
  );
}

/* ── Hero Metrics ── */

function HeroMetrics({ activeMaster }: { activeMaster: string }) {
  if (activeMaster === 'all') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard value="688 → 488" label="Customers" subtitle={<ReductionBadge pct="29.1%" />} tooltip="Customer entity count before and after deduplication" />
        <MetricCard value="50 → 32" label="Categories" subtitle={<ReductionBadge pct="36%" />} tooltip="Product category count before and after harmonization" />
        <MetricCard value="34 → 29" label="Brands" subtitle={<ReductionBadge pct="15%" />} tooltip="Brand count before and after dictionary normalization" />
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

/* ── Tab 1: Harmonization Impact ── */

function HarmonizationTab({ activeMaster }: { activeMaster: string }) {
  if (activeMaster === 'all') {
    const chartData = sharedData.harmonizationTable.map(r => ({
      dimension: r.dimension,
      Before: r.beforeCount,
      After: r.afterCount,
    }));
    return (
      <>
        <div className="px-6 pt-4 pb-3">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={2} barCategoryGap="30%">
              <XAxis dataKey="dimension" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} width={35} />
              <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#9CA3AF', paddingTop: 4 }} />
              <Bar dataKey="Before" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="After" fill="#F97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <TH align="left">Dimension</TH>
            <TH align="right">Before</TH>
            <TH align="right"><span className="inline-flex items-center gap-1">Top-1 Share <InfoTooltip text="Revenue percentage of the largest item in this dimension" /></span></TH>
            <TH align="right">After</TH>
            <TH align="right"><span className="inline-flex items-center gap-1">Top-1 Share <InfoTooltip text="Revenue percentage after harmonization" /></span></TH>
            <TH align="right">Reduction</TH>
          </tr>
        </thead>
        <tbody>
          {sharedData.harmonizationTable.map((row, i) => (
            <TR key={i}>
              <TD className="font-medium text-gray-900 dark:text-gray-100">{row.dimension}</TD>
              <TD align="right" className="text-gray-500">{row.beforeCount}</TD>
              <TD align="right" className="text-gray-400">{row.beforeTopShare}</TD>
              <TD align="right" className="font-medium text-gray-900 dark:text-gray-100">{row.afterCount}</TD>
              <TD align="right" className="text-gray-400">{row.afterTopShare}</TD>
              <TD align="right" className="text-emerald-600 dark:text-emerald-400 font-medium">{row.reduction}</TD>
            </TR>
          ))}
        </tbody>
      </table>
      </>
    );
  }

  if (activeMaster === 'customer') {
    const rows = [
      { dim: 'Customer Names', before: '688 raw names', after: '488 golden names', reduction: '29.1%' },
      { dim: 'Duplicate Clusters', before: '0 identified', after: '200 resolved', reduction: '100%' },
      { dim: 'Cross-ERP Entities', before: '0 linked', after: '7 clusters', reduction: 'New' },
      { dim: 'Country Formats', before: '12 variants', after: '12 ISO standard', reduction: 'Normalized' },
    ];
    return (
      <table className="w-full text-sm">
        <thead>
          <tr>
            <TH align="left">Dimension</TH>
            <TH align="right">Before MDM</TH>
            <TH align="right">After MDM</TH>
            <TH align="right">Impact</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <TR key={i}>
              <TD className="font-medium text-gray-900 dark:text-gray-100">{r.dim}</TD>
              <TD align="right" className="text-gray-500">{r.before}</TD>
              <TD align="right" className="font-medium text-gray-900 dark:text-gray-100">{r.after}</TD>
              <TD align="right" className="text-emerald-600 dark:text-emerald-400 font-medium">{r.reduction}</TD>
            </TR>
          ))}
        </tbody>
      </table>
    );
  }

  if (activeMaster === 'product') {
    const rows = [
      { dim: 'Brand Variants', before: '40+ raw variants', after: '29 standardized', reduction: '15%' },
      { dim: 'Product Categories', before: '50 source codes', after: '32 enterprise hierarchy', reduction: '36%' },
      { dim: 'Within-Source Dupes', before: '17 undetected', after: '0 remaining', reduction: '100%' },
      { dim: 'Cross-Source Links', before: '0 identified', after: '6 Infor↔SAP matches', reduction: 'New' },
    ];
    return (
      <table className="w-full text-sm">
        <thead>
          <tr>
            <TH align="left">Dimension</TH>
            <TH align="right">Before MDM</TH>
            <TH align="right">After MDM</TH>
            <TH align="right">Impact</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <TR key={i}>
              <TD className="font-medium text-gray-900 dark:text-gray-100">{r.dim}</TD>
              <TD align="right" className="text-gray-500">{r.before}</TD>
              <TD align="right" className="font-medium text-gray-900 dark:text-gray-100">{r.after}</TD>
              <TD align="right" className="text-emerald-600 dark:text-emerald-400 font-medium">{r.reduction}</TD>
            </TR>
          ))}
        </tbody>
      </table>
    );
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

/* ── Tab 2: Before & After ── */

function BeforeAfterTab({ activeMaster }: { activeMaster: string }) {
  const data = activeMaster === 'product'
    ? productData.beforeAfter
    : activeMaster === 'customer'
      ? customerData.beforeAfter
      : activeMaster === 'all'
        ? [
            { metric: 'Total Source Records', before: '1,539', after: '1,322', change: '14.1% reduction', tip: 'Combined customer + product records across all ERPs' },
            { metric: 'Customer Records', before: 688, after: 488, change: '29.1% reduction', tip: 'Customer master records before and after dedup' },
            { metric: 'Product Records', before: 851, after: 834, change: '2.0% reduction', tip: 'Product master records before and after dedup' },
            { metric: 'Duplicate Clusters', before: 0, after: 217, change: 'All identified', tip: 'Total matching clusters found (customer + product)' },
            { metric: 'Cross-ERP Linkages', before: 0, after: 13, change: 'Fully linked', tip: 'Entities discovered across multiple ERP systems' },
            { metric: 'Quality Issues', before: 0, after: 53, change: '53 flagged', tip: 'Data quality issues identified for remediation' },
            { metric: 'Categories Harmonized', before: 50, after: 32, change: '36% reduction', tip: 'Product categories unified via enterprise hierarchy' },
            { metric: 'Channels Standardized', before: 28, after: 12, change: '57% reduction', tip: 'Sales channels consolidated under standard taxonomy' },
          ]
        : [
            { metric: 'Business Units', before: 4, after: 4, change: 'Mapped', tip: 'Business units mapped to ERP systems' },
            { metric: 'GOIDs Assigned', before: 0, after: 10, change: 'All assigned', tip: 'Global Organisation IDs created' },
            { metric: 'Hierarchy Levels', before: 0, after: 3, change: 'Established', tip: 'Group → BU → Division hierarchy created' },
          ];

  const tooltipMap: Record<string, string> = {
    'Total Source Records': 'Total raw records ingested from all ERP systems',
    'Duplicates Resolved': 'Records confirmed as duplicates and merged into golden records',
    'Invalid Records': 'Records that failed validation (placeholders, test data, incomplete)',
    'Suspect Records': 'Records with potential quality issues requiring review',
    'Cross-System Linkage': 'Golden records linked to their source records across ERPs',
    'Quality Issues Flagged': 'Data quality issues identified for remediation',
    'Matching Clusters': 'Groups of records representing the same real-world entity',
    'Country Standardization': 'Raw country formats normalized to ISO standard',
  };

  return (
    <>
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
        {data.map((row, i) => {
          const tip = ('tip' in row ? (row as { tip: string }).tip : null) ?? tooltipMap[row.metric] ?? '';
          return (
            <TR key={i}>
              <TD className="font-medium text-gray-900 dark:text-gray-100">
                <span className="inline-flex items-center gap-1">
                  {row.metric}
                  {tip && <InfoTooltip text={tip} />}
                </span>
              </TD>
              <TD align="right" className="text-gray-500">{row.before}</TD>
              <TD align="right" className="font-medium text-gray-900 dark:text-gray-100">{row.after}</TD>
              <TD align="right" className="text-emerald-600 dark:text-emerald-400 font-medium">{row.change}</TD>
            </TR>
          );
        })}
      </tbody>
    </table>
    </>
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
