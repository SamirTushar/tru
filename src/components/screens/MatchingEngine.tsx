'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { ERPBadge } from '@/components/shared/ERPBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TabSwitcher } from '@/components/shared/TabSwitcher';
import customerData from '@/data/customer.json';
import productData from '@/data/product.json';
import { cn, formatCurrency } from '@/lib/utils';
import { Check, ChevronDown, ChevronRight, ChevronLeft, Info, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExplainPayload } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';

/* ── Data key constants (fuzzy has \n in keys) ── */
const FK = {
  CONF: 'Confidence\n(Composite)',
  TS: 'TS Score\n(\u00d70.5)',
  TSET: 'TSET Score\n(\u00d70.3)',
  JACC: 'JACC Score\n(\u00d70.2)',
  CLASS: 'Match Class',
};

type MatchRecord = Record<string, unknown>;

function getStr(r: MatchRecord, key: string): string {
  return String(r[key] ?? '');
}
function getNum(r: MatchRecord, key: string): number {
  const v = r[key];
  return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
}

/* ── Derive needs-review vs auto-merged from actual data ── */

function deriveMatchData(fuzzyLog: MatchRecord[], exactLog: MatchRecord[]) {
  const validFuzzy = fuzzyLog.filter(r => getStr(r, 'Core Name A'));
  const needsReview = validFuzzy.filter(r => getNum(r, FK.CONF) < 0.92);
  const autoMergedFuzzy = validFuzzy.filter(r => getNum(r, FK.CONF) >= 0.92);
  // Normalize exact matches to same shape for auto-merged display
  const autoMerged = [
    ...exactLog.map(r => ({ ...r, _type: 'exact' as const, _conf: getNum(r, 'Confidence') })),
    ...autoMergedFuzzy.map(r => ({ ...r, _type: 'fuzzy' as const, _conf: getNum(r, FK.CONF) })),
  ];
  return { needsReview, autoMerged };
}

/* ── Generate short issue phrase ── */

function generateKeyIssue(nameA: string, nameB: string): string {
  const a = nameA.trim();
  const b = nameB.trim();
  if (a === b) return 'Identical names';

  // Trailing characters (hyphen, space)
  const aClean = a.replace(/[-\s]+$/, '');
  const bClean = b.replace(/[-\s]+$/, '');
  if (aClean === bClean) return 'Trailing characters';

  const tokA = a.split(/\s+/);
  const tokB = b.split(/\s+/);

  // One is prefix of the other
  const shorter = tokA.length <= tokB.length ? tokA : tokB;
  const longer = tokA.length <= tokB.length ? tokB : tokA;
  if (shorter.every((t, i) => t === longer[i])) return 'Extra suffix tokens';

  // Check if tokens are same but reordered
  const sortedA = [...tokA].sort().join(' ');
  const sortedB = [...tokB].sort().join(' ');
  if (sortedA === sortedB) return 'Word order differs';

  // Token-level abbreviation (one token is prefix of corresponding token)
  if (tokA.length === tokB.length) {
    const abbrevCount = tokA.filter((t, i) => t !== tokB[i] && (t.startsWith(tokB[i]) || tokB[i].startsWith(t))).length;
    if (abbrevCount > 0 && abbrevCount <= 2) return 'Name abbreviated';
  }

  // Location suffix differs (shared prefix, different last token)
  if (tokA.length === tokB.length && tokA.length > 1) {
    const prefixMatch = tokA.slice(0, -1).join(' ') === tokB.slice(0, -1).join(' ');
    if (prefixMatch) return 'Location suffix differs';
  }

  return 'Spelling variant';
}

/* ── Main Component ── */

export function MatchingEngine() {
  const { activeMaster } = useApp();
  const [tab, setTab] = useState<'review' | 'merged' | 'trees'>('review');

  if (activeMaster === 'organisation') {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">Organisation records use hierarchy mapping, not matching.</p>
        <p className="text-sm mt-2">Switch to Customer or Product to view matching results.</p>
      </div>
    );
  }

  const isProduct = activeMaster === 'product';
  const isAll = activeMaster === 'all';

  // Derive data — use customer matching data for "all" and "customer"
  const { needsReview, autoMerged } = useMemo(() => {
    if (isProduct) {
      return { needsReview: [] as MatchRecord[], autoMerged: [] as (MatchRecord & { _type: string; _conf: number })[] };
    }
    return deriveMatchData(customerData.fuzzyMatchLog, customerData.exactMatchLog);
  }, [isProduct]);

  const reviewCount = needsReview.length;
  const mergedCount = isProduct
    ? (productData.dashboard.withinSourceDupes + productData.dashboard.crossSourceMatches)
    : autoMerged.length;

  const tabs = isProduct
    ? [
        { id: 'merged', label: `Auto-Merged (${mergedCount})` },
      ]
    : [
        { id: 'review', label: `Needs Review (${reviewCount})` },
        { id: 'merged', label: `Auto-Merged (${mergedCount})` },
        { id: 'trees', label: 'Group Trees' },
      ];

  return (
    <div className="space-y-7">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {isAll ? (
          <>
            <MetricCard value="179" label="Exact Matches" subtitle="Customer domain" tooltip="Record pairs with identical core name and country after cleaning pipeline" />
            <MetricCard value="21" label="Fuzzy Matches" subtitle="Confidence >= 0.85" tooltip="Record pairs matched by composite similarity score (>= 0.85 threshold)" />
            <MetricCard value="13" label="Cross-ERP Clusters" subtitle="7 customer + 6 product" tooltip="Entity groups that span multiple ERP systems across all domains" />
            <MetricCard value="217" label="Total Duplicates" subtitle="200 customer + 17 product" tooltip="Total duplicate records identified and resolved across all sources and domains" />
          </>
        ) : isProduct ? (
          <>
            <MetricCard value="17" label="Within-Source Dupes" subtitle="Same Product ID" tooltip="Duplicate records found within the same ERP system" />
            <MetricCard value="6" label="Cross-Source Matches" subtitle="Infor <> SAP" tooltip="Product matches found across different ERP systems" />
            <MetricCard value="2.0%" label="Dedup Rate" subtitle="17 of 851 records" tooltip="Percentage of source records identified as duplicates and merged" />
            <MetricCard value="4" label="ERP Systems" subtitle="Analyzed" tooltip="Number of ERP systems analyzed for matching" />
          </>
        ) : (
          <>
            <MetricCard value="179" label="Exact Matches" subtitle="Confidence = 1.00" tooltip="Record pairs with identical core name and country after cleaning pipeline" />
            <MetricCard value="21" label="Fuzzy Matches" subtitle="Confidence >= 0.85" tooltip="Record pairs matched by composite similarity score (>= 0.85 threshold)" />
            <MetricCard value="7" label="Cross-ERP Clusters" subtitle="Multi-system entities" tooltip="Entity groups that span multiple ERP systems" />
            <MetricCard value="200" label="Total Duplicates" subtitle="Resolved" tooltip="Total duplicate records identified and resolved across all sources" />
          </>
        )}
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => setTab(id as 'review' | 'merged' | 'trees')}
      />

      {/* Tab content */}
      {tab === 'review' && !isProduct && <NeedsReviewTab items={needsReview} />}
      {tab === 'merged' && <AutoMergedTab items={autoMerged} isProduct={isProduct} />}
      {tab === 'trees' && !isProduct && <GroupTrees />}
    </div>
  );
}

/* ── Tab 1: Needs Review ── */

function NeedsReviewTab({ items }: { items: MatchRecord[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [separated, setSeparated] = useState<Set<number>>(new Set());
  const { openExplainDrawer } = useApp();

  const pendingCount = items.length - approved.size - separated.size;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold text-gray-900 dark:text-gray-100">{pendingCount} matches need your review</span>
        {' '}&mdash; medium confidence or cross-system conflicts
      </p>

      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr>
              <th className="w-[35%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Entity Name</th>
              <th className="w-[15%] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Confidence</th>
              <th className="w-[15%] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Source</th>
              <th className="w-[30%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Key Issue</th>
              <th className="w-[5%] px-2 py-3 border-b border-gray-100 dark:border-slate-700/50" />
            </tr>
          </thead>
          <tbody>
        {items.map((item, i) => {
          const nameA = getStr(item, 'Core Name A');
          const nameB = getStr(item, 'Core Name B');
          const conf = getNum(item, FK.CONF);
          const cls = getStr(item, FK.CLASS);
          const srcA = getStr(item, 'Src A');
          const srcB = getStr(item, 'Src B');
          const issue = generateKeyIssue(nameA, nameB);
          const isExpanded = expandedIdx === i;
          const isApproved = approved.has(i);
          const isSeparated = separated.has(i);
          const isResolved = isApproved || isSeparated;

          return (
            <React.Fragment key={i}>
              <tr
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className={cn(
                  'cursor-pointer transition-colors duration-150 border-b border-gray-50 dark:border-slate-700/30',
                  isExpanded ? 'bg-orange-50/60 dark:bg-orange-950/15' : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/20',
                  isResolved && 'opacity-60'
                )}
              >
                <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100 truncate">
                  {nameA}
                  {isApproved && <span className="ml-2 text-[10px] text-emerald-600 font-medium">Approved</span>}
                  {isSeparated && <span className="ml-2 text-[10px] text-gray-400 font-medium">Separated</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5">
                    <StatusBadge status={cls === 'HIGH' ? 'HIGH' : 'MEDIUM'} />
                    <span className="text-xs text-gray-500">{(conf * 100).toFixed(0)}%</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex gap-1 justify-center">
                    <ERPBadge system={srcA} />
                    {srcB !== srcA && <ERPBadge system={srcB} />}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500 truncate">{issue}</td>
                <td className="px-2 py-3 text-right">
                  {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </td>
              </tr>

              {isExpanded && (
                <tr>
                  <td colSpan={5} className="p-0 bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-700/50">
                <div className="px-5 pb-5 pt-3">
                  {/* Matched / Differs */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Matched</p>
                      <div className="text-sm space-y-1">
                        {nameA.split(' ').filter((t, j) => nameB.split(' ')[j] === t).length > 0 && (
                          <p className="text-gray-700 dark:text-gray-300">
                            Core tokens: {nameA.split(' ').filter((t, j) => nameB.split(' ')[j] === t).join(' ') || 'Partial overlap'}
                          </p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300">Country: {getStr(item, 'Country')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Differs</p>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-700 dark:text-gray-300">Name A: <span className="font-medium">{nameA}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Name B: <span className="font-medium">{nameB}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Compact record cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <RecordCard source={srcA} custId={getStr(item, 'Cust ID A')} name={nameA} />
                    <RecordCard source={srcB} custId={getStr(item, 'Cust ID B')} name={nameB} />
                  </div>

                  {/* Recommendation */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">Recommendation:</span> Merge &mdash; {issue.toLowerCase()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={isResolved}
                      className={isApproved ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                      onClick={() => { setApproved(prev => new Set(prev).add(i)); setExpandedIdx(null); }}
                    >
                      {isApproved ? <><Check size={14} className="mr-1" /> Approved</> : <><Check size={14} className="mr-1" /> Approve Merge</>}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isResolved}
                      onClick={() => { setSeparated(prev => new Set(prev).add(i)); setExpandedIdx(null); }}
                    >
                      <X size={14} className="mr-1" /> Keep Separate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700"
                      onClick={() => {
                        openExplainDrawer({
                          entityName: nameA,
                          coreNameA: nameA,
                          coreNameB: nameB,
                          sourceA: srcA,
                          sourceB: srcB,
                          country: getStr(item, 'Country'),
                          scores: { ts: getNum(item, FK.TS), tset: getNum(item, FK.TSET), jacc: getNum(item, FK.JACC), composite: conf },
                          matchClass: cls,
                          matchType: 'fuzzy',
                          clusterId: getStr(item, 'Cluster ID'),
                        });
                      }}
                    >
                      <Info size={14} className="mr-1" /> Explain
                    </Button>
                  </div>
                </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordCard({ source, custId, name }: { source: string; custId: string; name: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700/60">
      <div className="flex items-center justify-between mb-2">
        <ERPBadge system={source} />
        <span className="text-[10px] text-gray-400 font-mono">{custId}</span>
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p>
    </div>
  );
}

/* ── Tab 2: Auto-Merged ── */

function AutoMergedTab({ items, isProduct }: { items: (MatchRecord & { _type?: string; _conf?: number })[]; isProduct: boolean }) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // For product, build from product data
  const displayItems = useMemo(() => {
    if (isProduct) {
      const dupes = (productData.duplicateLog || []).map((r: MatchRecord) => ({
        entity: getStr(r, 'Golden Description') || getStr(r, 'Product ID A') || 'Product',
        type: 'Within-Source',
        confidence: 1.0,
        merged: 2,
        sources: getStr(r, 'Source') || 'Epicor',
      }));
      const cross = (productData.crossSourceMatches || []).map((r: MatchRecord) => ({
        entity: getStr(r, 'Description A') || 'Cross-Source Product',
        type: 'Cross-Source',
        confidence: getNum(r, 'Confidence') || 0.97,
        merged: 2,
        sources: `${getStr(r, 'Source A') || 'Infor'}, ${getStr(r, 'Source B') || 'SAP'}`,
      }));
      return [...dupes, ...cross];
    }
    return items.map(r => ({
      entity: getStr(r, 'Core Name A'),
      type: r._type === 'exact' ? 'Exact' : 'Fuzzy',
      confidence: r._conf ?? getNum(r, 'Confidence'),
      merged: 2,
      sources: getStr(r, 'Src A') + (getStr(r, 'Src B') !== getStr(r, 'Src A') ? `, ${getStr(r, 'Src B')}` : ''),
    }));
  }, [items, isProduct]);

  const sorted = useMemo(() => {
    if (!sortKey) return displayItems;
    return [...displayItems].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [displayItems, sortKey, sortDir]);

  const pageSize = 20;
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const mergedCount = displayItems.length;

  return (
    <div className="space-y-4">
      {/* Match type donut + header */}
      {!isProduct && (
        <div className="flex items-center gap-6">
          <div className="w-[100px] h-[100px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: 'Exact', value: 179 }, { name: 'Fuzzy', value: 21 }]} innerRadius={30} outerRadius={44} paddingAngle={3} dataKey="value" stroke="none">
                  <Cell fill="#3B82F6" />
                  <Cell fill="#F97316" />
                </Pie>
                <RTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">200</span>
              <span className="text-[9px] text-gray-400">Total</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{mergedCount} matches auto-merged</p>
            <p className="text-xs text-gray-400 mt-1">High confidence, no review needed</p>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500" />Exact 179</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-orange-500" />Fuzzy 21</span>
            </div>
          </div>
        </div>
      )}
      {isProduct && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{mergedCount} matches auto-merged</span>
          {' '}&mdash; high confidence, no review needed
        </p>
      )}

      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <SortTH label="Entity" sortKey="entity" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortTH label="Match Type" sortKey="type" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortTH label="Confidence" sortKey="confidence" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortTH label="Merged" sortKey="merged" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Sources</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Status</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
                <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{item.entity}</td>
                <td className="px-4 py-4">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-semibold',
                    item.type === 'Exact' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                  )}>{item.type}</span>
                </td>
                <td className="px-4 py-4 text-right font-mono text-xs text-gray-500">{item.confidence.toFixed(2)}</td>
                <td className="px-4 py-4 text-right text-gray-500">{item.merged}</td>
                <td className="px-4 py-4 text-gray-500 text-xs">{item.sources}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <Check size={12} /> Merged
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-700/50">
            <span className="text-xs text-gray-400">Page {page + 1} of {totalPages} ({sorted.length} records)</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SortTH({ label, sortKey: sk, current, dir, onSort, align = 'left' }: {
  label: string; sortKey: string; current: string; dir: string; onSort: (k: string) => void; align?: 'left' | 'right';
}) {
  const isActive = current === sk;
  return (
    <th
      className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors', align === 'right' ? 'text-right' : 'text-left')}
      onClick={() => onSort(sk)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={11} className={isActive ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'} />
      </span>
    </th>
  );
}

/* ── Tab 3: Group Trees (unchanged) ── */

function GroupTrees() {
  const trees = customerData.groupTrees;
  const treeEntries = Object.entries(trees) as [string, typeof trees.lulu][];

  return (
    <div className="space-y-4">
      {treeEntries.map(([key, tree]) => (
        <GroupTreeCard key={key} tree={tree} />
      ))}
    </div>
  );
}

function GroupTreeCard({ tree }: { tree: typeof customerData.groupTrees.lulu }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<number>>(new Set());

  const toggleBranch = (idx: number) => {
    setExpandedBranches(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <p className="font-semibold text-gray-900 dark:text-gray-100">{tree.name}</p>
        </div>
        <span className="text-sm text-gray-500">
          {tree.totalRaw} &rarr; {tree.totalGolden} names &nbsp;&middot;&nbsp; {tree.consolidation} consolidation
        </span>
      </button>

      {/* Tree body with connector lines */}
      {expanded && (
        <div className="pb-4 pl-9 pr-5">
          <div className="border-l-2 border-gray-200 dark:border-slate-700">
            {tree.branches.map((branch, i) => {
              const isLast = i === tree.branches.length - 1;
              const hasMembers = branch.members.length > 0;
              const isBranchExpanded = expandedBranches.has(i);
              const remaining = branch.namesMerged - branch.members.length;

              return (
                <div key={i} className="relative">
                  {/* Horizontal connector */}
                  <span className="absolute left-0 top-[18px] w-4 border-t-2 border-gray-200 dark:border-slate-700" />
                  {isLast && <span className="absolute left-[-1px] top-[18px] bottom-0 w-[2px] bg-white dark:bg-slate-800/80" />}

                  {/* Branch row */}
                  <div
                    className={cn('ml-5 py-2 flex items-center justify-between', hasMembers && 'cursor-pointer')}
                    onClick={() => hasMembers && toggleBranch(i)}
                  >
                    <div className="flex items-center gap-2">
                      {hasMembers && (isBranchExpanded ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />)}
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{branch.golden}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {branch.namesMerged === 1 ? '1 name' : `${branch.namesMerged} names merged`}
                    </span>
                  </div>

                  {/* Members (nested tree level) */}
                  {isBranchExpanded && hasMembers && (
                    <div className="ml-5 border-l-2 border-gray-100 dark:border-slate-700/50">
                      {branch.members.map((m, j) => {
                        const isLastMember = j === branch.members.length - 1 && remaining <= 0;
                        return (
                          <div key={j} className="relative">
                            <span className="absolute left-0 top-[14px] w-3 border-t-2 border-gray-100 dark:border-slate-700/50" />
                            {isLastMember && <span className="absolute left-[-1px] top-[14px] bottom-0 w-[2px] bg-white dark:bg-slate-800/80" />}
                            <div className="ml-4 py-1.5 flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{m.name}</span>
                              <ERPBadge system={m.source} />
                            </div>
                          </div>
                        );
                      })}
                      {remaining > 0 && (
                        <div className="relative">
                          <span className="absolute left-0 top-[14px] w-3 border-t-2 border-gray-100 dark:border-slate-700/50" />
                          <span className="absolute left-[-1px] top-[14px] bottom-0 w-[2px] bg-white dark:bg-slate-800/80" />
                          <p className="ml-4 py-1.5 text-xs text-gray-400 italic">+{remaining} more...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
