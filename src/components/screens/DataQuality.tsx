'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { ERPBadge } from '@/components/shared/ERPBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActionBadge } from '@/components/shared/ActionBadge';
import { TabSwitcher } from '@/components/shared/TabSwitcher';
import customerData from '@/data/customer.json';
import productData from '@/data/product.json';
import { cn } from '@/lib/utils';
import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';

const ACTION_CHART_COLORS: Record<string, string> = {
  DELETE: '#EF4444',
  ARCHIVE: '#6366F1',
  REVIEW: '#F59E0B',
  RECLASSIFY: '#8B5CF6',
  ENRICH: '#F97316',
};

export function DataQuality() {
  const { activeMaster } = useApp();
  const [activeAction, setActiveAction] = useState<string>('All');
  const [activeErp, setActiveErp] = useState<string>('All');
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());

  const isOrg = activeMaster === 'organisation';
  const isProduct = activeMaster === 'product';
  const isAll = activeMaster === 'all';

  const rawIssues: Record<string, unknown>[] = isOrg
    ? []
    : isProduct
      ? productData.qualityIssues
      : isAll
        ? [...customerData.qualityIssues, ...productData.qualityIssues]
        : customerData.qualityIssues;

  const actionSummary = isProduct
    ? productData.qualityActionSummary
    : isAll
      ? {
          DELETE: customerData.qualityActionSummary.DELETE + productData.qualityActionSummary.DELETE,
          ARCHIVE: customerData.qualityActionSummary.ARCHIVE,
          REVIEW: customerData.qualityActionSummary.REVIEW + productData.qualityActionSummary.REVIEW,
          RECLASSIFY: productData.qualityActionSummary.RECLASSIFY,
          ENRICH: productData.qualityActionSummary.ENRICH,
        }
      : customerData.qualityActionSummary;

  const sourceKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('source')) ?? 'Source';
  const idKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('id') && k.toLowerCase().includes('src')) ?? Object.keys(rawIssues[0] || {})[1] ?? 'ID';
  const nameKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('name') && k.toLowerCase().includes('raw')) ?? Object.keys(rawIssues[0] || {})[2] ?? 'Name';
  const countryKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('country')) ?? 'Country';
  const qualityKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('quality') || k.toLowerCase().includes('flag')) ?? 'Quality';
  const actionKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('action') && !k.toLowerCase().includes('summary')) ?? 'Action';
  const reasonKey = Object.keys(rawIssues[0] || {}).find(k => k.toLowerCase().includes('reason') || k.toLowerCase().includes('detail')) ?? 'Reason';

  const getVal = (row: Record<string, unknown>, key: string) => String(row[key] ?? '');

  const filtered = useMemo(() => {
    return rawIssues.filter(row => {
      const action = getVal(row, actionKey).toUpperCase();
      const source = getVal(row, sourceKey);
      if (activeAction !== 'All' && !action.includes(activeAction.toUpperCase())) return false;
      if (activeErp !== 'All' && source !== activeErp) return false;
      return true;
    });
  }, [rawIssues, activeAction, activeErp, actionKey, sourceKey]);

  const erpConcentration = useMemo(() => {
    const counts: Record<string, number> = {};
    rawIssues.forEach(row => {
      const src = getVal(row, sourceKey);
      if (src) counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rawIssues, sourceKey]);

  const totalIssues = rawIssues.length;
  const actions = Object.entries(actionSummary).filter(([, v]) => v > 0);

  if (isOrg) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No quality issues for Organisation domain.</p>
        <p className="text-sm mt-2">Switch to Customer or Product to view quality issues.</p>
      </div>
    );
  }

  // Build action filter tabs
  const actionTabs = [
    { id: 'All', label: `All (${totalIssues})` },
    ...actions.map(([action, count]) => ({ id: action, label: `${action} (${count})` })),
  ];

  // Build ERP filter tabs
  const erpTabs = [
    { id: 'All', label: 'All' },
    ...['SAP', 'Oracle', 'Epicor', 'Infor'].filter(erp => erpConcentration.some(([e]) => e === erp)).map(erp => ({ id: erp, label: erp })),
  ];

  return (
    <div className="space-y-7">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MetricCard value={totalIssues} label="Issues Flagged" subtitle="Across all sources" tooltip="Total records flagged with data quality issues" />
        <MetricCard value={confirmed.size} label="Issues Resolved" subtitle={`${totalIssues - confirmed.size} remaining`} tooltip="Issues reviewed and confirmed by the user" />
        <MetricCard value={erpConcentration[0]?.[0] ?? '-'} label="Most Issues" subtitle={`${erpConcentration[0]?.[1] ?? 0} issues`} tooltip="The ERP system with the highest number of quality issues" />
        <MetricCard value={`${Math.round((confirmed.size / Math.max(totalIssues, 1)) * 100)}%`} label="Resolution Rate" subtitle="Progress" tooltip="Percentage of flagged issues that have been resolved" valueColor={confirmed.size > 0 ? 'text-emerald-600 dark:text-emerald-400' : undefined} />
      </div>

      {/* Donut + source breakdown side by side */}
      {actions.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Action donut */}
          <div className="flex items-center gap-4">
            <div className="w-[130px] h-[130px] shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={actions.map(([name, value]) => ({ name, value }))} innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value" stroke="none">
                    {actions.map(([action], idx) => (
                      <Cell key={idx} fill={ACTION_CHART_COLORS[action] ?? '#6B7280'} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalIssues}</span>
                <span className="text-[10px] text-gray-400">Issues</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {actions.map(([action, count]) => (
                <div key={action} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ACTION_CHART_COLORS[action] ?? '#6B7280' }} />
                  <span className="text-gray-700 dark:text-gray-300">{action}</span>
                  <span className="text-gray-400 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Source donut */}
          <div className="flex items-center gap-4">
            <div className="w-[130px] h-[130px] shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={erpConcentration.map(([name, value]) => ({ name, value }))} innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value" stroke="none">
                    {erpConcentration.map(([erp], idx) => (
                      <Cell key={idx} fill={({'SAP':'#3B82F6','Oracle':'#F97316','Epicor':'#8B5CF6','Infor':'#06B6D4'} as Record<string,string>)[erp] ?? '#6B7280'} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalIssues}</span>
                <span className="text-[10px] text-gray-400">Issues</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">By Source</p>
              {erpConcentration.map(([erp, count]) => (
                <div key={erp} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ({'SAP':'#3B82F6','Oracle':'#F97316','Epicor':'#8B5CF6','Infor':'#06B6D4'} as Record<string,string>)[erp] ?? '#6B7280' }} />
                  <span className="text-gray-700 dark:text-gray-300">{erp}</span>
                  <span className="text-gray-400 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs — action type + ERP source */}
      <div className="flex flex-wrap items-center gap-3">
        <TabSwitcher tabs={actionTabs} activeTab={activeAction} onTabChange={setActiveAction} />
        <span className="h-6 border-l border-gray-300 dark:border-slate-600" />
        <TabSwitcher tabs={erpTabs} activeTab={activeErp} onTabChange={setActiveErp} />
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Source</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Src ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Raw Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Country</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Quality</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Action</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Reason</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
                  <td className="px-5 py-4"><ERPBadge system={getVal(row, sourceKey)} /></td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-xs">{getVal(row, idKey)}</td>
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{getVal(row, nameKey)}</td>
                  <td className="px-5 py-4 text-gray-500">{getVal(row, countryKey)}</td>
                  <td className="px-5 py-4"><StatusBadge status={getVal(row, qualityKey)} /></td>
                  <td className="px-5 py-4"><ActionBadge action={getVal(row, actionKey)} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs max-w-[250px] truncate">{getVal(row, reasonKey)}</td>
                  <td className="px-5 py-4 text-center">
                    <Button
                      size="sm"
                      variant={confirmed.has(i) ? 'default' : 'outline'}
                      className={cn('h-7 text-xs', confirmed.has(i) && 'bg-emerald-500 hover:bg-emerald-500')}
                      onClick={() => setConfirmed(prev => new Set(prev).add(i))}
                      disabled={confirmed.has(i)}
                    >
                      {confirmed.has(i) ? <Check size={12} /> : 'Confirm'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">No issues match the current filters.</div>
        )}
      </div>
    </div>
  );
}
