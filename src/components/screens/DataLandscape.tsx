'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { ERPBadge } from '@/components/shared/ERPBadge';
import { DataTable } from '@/components/shared/DataTable';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { TabSwitcher } from '@/components/shared/TabSwitcher';
import customerData from '@/data/customer.json';
import productData from '@/data/product.json';
import orgData from '@/data/organisation.json';
import { ERP_COLORS } from '@/lib/constants';
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';

const countryData = [
  { country: 'UAE', total: 602, golden: 404, dupRate: '32.9%' },
  { country: 'KSA', total: 41, golden: 41, dupRate: '0%' },
  { country: 'Qatar', total: 12, golden: 10, dupRate: '16.7%' },
  { country: 'Oman', total: 6, golden: 6, dupRate: '0%' },
  { country: 'USA', total: 5, golden: 5, dupRate: '0%' },
  { country: 'Bahrain', total: 5, golden: 5, dupRate: '0%' },
  { country: 'Kuwait', total: 4, golden: 4, dupRate: '0%' },
  { country: 'Pakistan', total: 4, golden: 4, dupRate: '0%' },
  { country: 'Lebanon', total: 2, golden: 2, dupRate: '0%' },
  { country: 'Azerbaijan', total: 2, golden: 2, dupRate: '0%' },
  { country: 'Jordan', total: 3, golden: 3, dupRate: '0%' },
  { country: 'Egypt', total: 2, golden: 2, dupRate: '0%' },
];

export function DataLandscape() {
  const { activeMaster } = useApp();
  const [activeTab, setActiveTab] = useState<'source' | 'country'>('source');

  return (
    <div className="space-y-7">
      <HeroMetrics activeMaster={activeMaster} />

      {activeMaster !== 'organisation' ? (
        <>
          {/* Two donuts side by side */}
          <SourceCountryDonuts activeMaster={activeMaster} />

          <TabSwitcher
            tabs={[{ id: 'source', label: 'Source Systems' }, { id: 'country', label: 'By Country' }]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as 'source' | 'country')}
          />

          <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl">
            {activeTab === 'source' && <SourceTable activeMaster={activeMaster} />}
            {activeTab === 'country' && <CountryTable />}
          </div>
        </>
      ) : (
        <OrgView />
      )}
    </div>
  );
}

function HeroMetrics({ activeMaster }: { activeMaster: string }) {
  if (activeMaster === 'product') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MetricCard value="851" label="Total Source Records" subtitle="4 connected systems" tooltip="Total raw product records ingested from all ERP systems" />
        <MetricCard value="834" label="Golden Records" subtitle="Unique products" tooltip="Unique products after deduplication — one record per real-world product" />
        <MetricCard value="17" label="Duplicates Identified" subtitle="2.0% dedup rate" tooltip="Records identified as duplicates across all sources" />
        <MetricCard value="97/100" label="Data Quality" subtitle="23 issues in Epicor only" tooltip="Score based on completeness, validity, and consistency of source records" />
      </div>
    );
  }
  if (activeMaster === 'organisation') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MetricCard value="4" label="Business Units" subtitle="Mapped to ERPs" tooltip="Distinct business units mapped across the organisation" />
        <MetricCard value="4" label="ERPs Connected" subtitle="SAP, Oracle, Epicor, Infor" tooltip="Enterprise Resource Planning systems connected" />
        <MetricCard value="10" label="GOIDs Assigned" subtitle="Global Org IDs" tooltip="Global Organisation IDs — unique identifiers for each org entity" />
        <MetricCard value="3" label="Hierarchy Levels" subtitle="Group > BU > Division" tooltip="Depth of the organisational hierarchy tree" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      <MetricCard value="688" label="Total Source Records" subtitle="4 connected systems" tooltip="Total raw records ingested from all ERP systems" />
      <MetricCard value="488" label="Golden Records" subtitle="Unique entities" tooltip="Unique entities after deduplication — one record per real-world customer" />
      <MetricCard value="200" label="Duplicates Identified" subtitle="29.1% dedup rate" tooltip="Records identified as duplicates across all sources" />
      <MetricCard value="93/100" label="Data Quality" subtitle="Score across all sources" tooltip="Score based on completeness, validity, and consistency of source records" />
    </div>
  );
}

function SourceTable({ activeMaster }: { activeMaster: string }) {
  const isProduct = activeMaster === 'product';
  const breakdown = isProduct ? productData.sourceBreakdown : customerData.sourceBreakdown;
  const totalRow = {
    total: breakdown.reduce((s, r) => s + r.total, 0),
    golden: breakdown.reduce((s, r) => s + r.golden, 0),
    dupes: breakdown.reduce((s, r) => s + r.dupes, 0),
  };
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">System</th>
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Total</th>
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Golden</th>
          {!isProduct && <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Valid</th>}
          {!isProduct && <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Suspect</th>}
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Invalid</th>
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">
            <span className="inline-flex items-center gap-1">Dup Rate <InfoTooltip text="Percentage of records in this source identified as duplicates" /></span>
          </th>
        </tr>
      </thead>
      <tbody>
        {breakdown.map((row, i) => (
          <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
            <td className="px-6 py-4"><ERPBadge system={row.system} /></td>
            <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-100">{row.total}</td>
            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{row.golden}</td>
            {!isProduct && <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{(row as typeof customerData.sourceBreakdown[0]).valid}</td>}
            {!isProduct && <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{(row as typeof customerData.sourceBreakdown[0]).suspect}</td>}
            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{row.invalid}</td>
            <td className="px-6 py-4 text-right text-gray-500">{'dupRate' in row ? row.dupRate : `${((row.dupes / row.total) * 100).toFixed(1)}%`}</td>
          </tr>
        ))}
        <tr className="bg-gray-50/50 dark:bg-slate-800/30 font-semibold">
          <td className="px-6 py-4 text-gray-900 dark:text-gray-100">Total</td>
          <td className="px-6 py-4 text-right">{totalRow.total}</td>
          <td className="px-6 py-4 text-right">{totalRow.golden}</td>
          {!isProduct && <td className="px-6 py-4 text-right">—</td>}
          {!isProduct && <td className="px-6 py-4 text-right">—</td>}
          <td className="px-6 py-4 text-right">—</td>
          <td className="px-6 py-4 text-right">{((totalRow.dupes / totalRow.total) * 100).toFixed(1)}%</td>
        </tr>
      </tbody>
    </table>
  );
}

function CountryTable() {
  const columns = [
    { key: 'country', header: 'Country' },
    { key: 'total', header: 'Total', align: 'right' as const },
    { key: 'golden', header: 'Golden', align: 'right' as const },
    { key: 'dupRate', header: 'Dup Rate', align: 'right' as const },
  ];

  return <DataTable columns={columns} data={countryData} pageSize={12} />;
}

function OrgView() {
  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl px-6 py-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Organisation by ERP</h3>
      <div className="space-y-3">
        {orgData.businessUnits.map(bu => (
          <div key={bu.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/20 rounded-lg">
            <div className="flex items-center gap-3">
              <ERPBadge system={bu.erp} />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{bu.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{bu.hierarchy}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{bu.divisions} divisions</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COUNTRY_COLORS = ['#3B82F6', '#F97316', '#8B5CF6', '#06B6D4', '#10B981', '#94A3B8'];

function SourceCountryDonuts({ activeMaster }: { activeMaster: string }) {
  const isProduct = activeMaster === 'product';
  const breakdown = isProduct ? productData.sourceBreakdown : customerData.sourceBreakdown;
  const sourceData = breakdown.map(r => ({ name: r.system, value: r.total }));
  const sourceTotal = sourceData.reduce((s, d) => s + d.value, 0);

  const top5 = countryData.slice(0, 5);
  const othersTotal = countryData.slice(5).reduce((s, c) => s + c.total, 0);
  const cData = [...top5.map(c => ({ name: c.country, value: c.total })), ...(othersTotal > 0 ? [{ name: 'Others', value: othersTotal }] : [])];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex items-center gap-4">
        <div className="w-[140px] h-[140px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sourceData} innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value" stroke="none">
                {sourceData.map((entry, idx) => (
                  <Cell key={idx} fill={ERP_COLORS[entry.name] ?? '#6B7280'} />
                ))}
              </Pie>
              <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{sourceTotal}</span>
            <span className="text-[10px] text-gray-400">Total</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">By Source</p>
          {sourceData.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ERP_COLORS[d.name] ?? '#6B7280' }} />
              <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
              <span className="text-gray-400 font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-[140px] h-[140px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cData} innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value" stroke="none">
                {cData.map((_, idx) => (
                  <Cell key={idx} fill={COUNTRY_COLORS[idx % COUNTRY_COLORS.length]} />
                ))}
              </Pie>
              <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">12</span>
            <span className="text-[10px] text-gray-400">Countries</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">By Country</p>
          {cData.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
              <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
              <span className="text-gray-400 font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
