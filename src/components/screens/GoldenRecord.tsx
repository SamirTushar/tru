'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ERPBadge } from '@/components/shared/ERPBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MetricCard } from '@/components/shared/MetricCard';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { TabSwitcher } from '@/components/shared/TabSwitcher';
import customerData from '@/data/customer.json';
import productData from '@/data/product.json';
import orgData from '@/data/organisation.json';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, ChevronRight, ChevronLeft, ArrowUpDown, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ERP_COLORS } from '@/lib/constants';

/* ── Tag system ── */
const TAG_TOOLTIPS: Record<string, string> = {
  'Highest Completeness': 'Longest, most complete value wins',
  'Source Preferred': 'Value from the preferred source system for this field',
  'Source Priority': 'Determined by global source trust ranking',
  'Most Recent': 'Most recently updated value wins',
  'Most Frequent': 'Value appearing in the most source systems wins',
  'System Generated': 'Assigned by the MDM pipeline, not from a source',
};

function getFieldTag(fieldName: string): string {
  const lower = fieldName.toLowerCase();
  if (lower.includes('id') || lower.includes('cluster') || lower.includes('source erp') || lower.includes('# source') || lower.includes('cross') || lower.includes('quality') || lower.includes('after ') || lower.includes('product type')) return 'System Generated';
  if (lower.includes('name') || lower.includes('description')) return 'Highest Completeness';
  if (lower.includes('country') || lower.includes('std country')) return 'Source Preferred';
  return 'Source Priority';
}

function RuleTag({ fieldName }: { fieldName: string }) {
  const tag = getFieldTag(fieldName);
  const tip = TAG_TOOLTIPS[tag] ?? '';
  return (
    <span className="relative group">
      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-help whitespace-nowrap">{tag}</span>
      {tip && (
        <span className="absolute bottom-full left-0 mb-2 px-3 py-1.5 text-[11px] leading-snug text-gray-100 bg-gray-800 dark:bg-gray-700 rounded-md z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg" style={{ width: 'max-content', maxWidth: '320px' }}>
          {tip}
        </span>
      )}
    </span>
  );
}

/* ── Helpers ── */
function getField(r: Record<string, unknown>, ...candidates: string[]): unknown {
  for (const c of candidates) {
    if (r[c] !== undefined && r[c] !== '') return r[c];
    const nlKey = Object.keys(r).find(k => k.replace(/\n/g, ' ').trim() === c.trim());
    if (nlKey && r[nlKey] !== undefined && r[nlKey] !== '') return r[nlKey];
  }
  return '';
}

const CUSTOMER_DISPLAY_FIELDS = [
  'Global Customer ID', 'Core Name (Golden)', 'Full Std Name (S7)', 'Country',
  'Primary Source ERP', 'Source Cust ID', 'Original Raw Name', 'Quality Flag',
  'Cluster ID', 'Cluster Size', '# Source ERPs', 'Cross- ERP?', 'Std Country',
];
const PRODUCT_DISPLAY_FIELDS = [
  'GPID', 'Golden Description', 'Primary Source', 'Product ID', 'Brand (Normalized)',
  'Category (Std)', 'Pack Size', 'Quality', 'Product Type',
  'L1 Division', 'L2 Group', 'L3 Category', 'L4 Sub-Cat', 'L5 Brand',
];

/* ── Main Component ── */
export function GoldenRecord() {
  const { activeMaster } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const isOrg = activeMaster === 'organisation';
  const isProduct = activeMaster === 'product';
  const isAll = activeMaster === 'all';

  // Normalize records for "all" view — add _type and normalized accessor fields
  const records: Record<string, unknown>[] = useMemo(() => {
    if (isOrg) return [];
    if (isAll) {
      const custNorm = customerData.goldLayerRecords.map(r => ({
        ...r,
        _type: 'Customer',
        _id: getField(r, 'Global Customer ID'),
        _name: getField(r, 'Core Name (Golden)'),
        _source: getField(r, 'Primary Source ERP'),
        _quality: getField(r, 'Quality Flag'),
        _country: getField(r, 'Country'),
        _size: getField(r, 'Cluster Size'),
      }));
      const prodNorm = productData.goldenRecords.map(r => ({
        ...r,
        _type: 'Product',
        _id: getField(r, 'GPID'),
        _name: getField(r, 'Golden Description'),
        _source: getField(r, 'Primary Source'),
        _quality: getField(r, 'Quality'),
        _country: '',
        _size: '',
      }));
      return [...custNorm, ...prodNorm] as Record<string, unknown>[];
    }
    return isProduct ? productData.goldenRecords : customerData.goldLayerRecords;
  }, [isOrg, isAll, isProduct]);

  const idKey = isAll ? '_id' : isProduct ? 'GPID' : 'Global Customer ID';
  const nameKey = isAll ? '_name' : isProduct ? 'Golden Description' : 'Core Name (Golden)';
  const countryKey = isAll ? '' : isProduct ? '' : 'Country';
  const sourceKey = isAll ? '_source' : isProduct ? 'Primary Source' : 'Primary Source ERP';
  const qualityKey = isAll ? '_quality' : isProduct ? 'Quality' : 'Quality Flag';
  const sizeKey = isAll ? '' : isProduct ? '' : 'Cluster Size';

  const filtered = useMemo(() => {
    if (isOrg) return [];
    let result = records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = records.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = String(getField(a, sortKey));
        const bv = String(getField(b, sortKey));
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return result;
  }, [records, searchQuery, sortKey, sortDir, isOrg]);

  const silverData = useMemo(() => isProduct ? productData.silverAudit : customerData.silverAudit, [isProduct]);

  const pageSize = 20;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleSearch = (q: string) => { setSearchQuery(q); setPage(0); };

  if (isOrg) {
    return (
      <div className="space-y-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <MetricCard value="10" label="GOIDs Assigned" subtitle="Global Org IDs" tooltip="Global Organisation IDs — unique identifiers for each org entity" />
          <MetricCard value="4" label="Business Units" subtitle="Mapped" tooltip="Distinct business units in the hierarchy" />
          <MetricCard value="6" label="Divisions" subtitle="Under BMB" tooltip="Sub-divisions within the BMB business unit" />
          <MetricCard value="3" label="Hierarchy Levels" subtitle="Group > BU > Division" tooltip="Depth of the organisational hierarchy tree" />
        </div>
        <OrgGoldenView />
      </div>
    );
  }

  // DETAIL VIEW — when a record is selected
  if (selectedIdx !== null) {
    const record = filtered[selectedIdx];
    if (!record) { setSelectedIdx(null); return null; }

    // In "all" mode, determine record type for correct detail rendering
    const detailIsProduct = isAll ? record._type === 'Product' : isProduct;
    const detailIdKey = detailIsProduct ? 'GPID' : 'Global Customer ID';
    const detailNameKey = detailIsProduct ? 'Golden Description' : 'Core Name (Golden)';
    const detailSourceKey = detailIsProduct ? 'Primary Source' : 'Primary Source ERP';
    const detailQualityKey = detailIsProduct ? 'Quality' : 'Quality Flag';
    const detailSilverData = detailIsProduct ? productData.silverAudit : customerData.silverAudit;

    const recId = String(getField(record, isAll ? '_id' : detailIdKey));
    const recName = String(getField(record, isAll ? '_name' : detailNameKey));
    const recSource = String(getField(record, isAll ? '_source' : detailSourceKey));
    const recQuality = String(getField(record, isAll ? '_quality' : detailQualityKey));

    return (
      <DetailPage
        record={record}
        recId={recId}
        recName={recName}
        recSource={recSource}
        recQuality={recQuality}
        isProduct={detailIsProduct}
        idKey={detailIdKey}
        nameKey={detailNameKey}
        sourceKey={detailSourceKey}
        silverData={detailSilverData}
        onBack={() => setSelectedIdx(null)}
      />
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {isAll ? (
          <>
            <MetricCard value="1,322" label="Golden Records" subtitle="488 customer + 834 product" tooltip="Total unique entities across all domains after deduplication" />
            <MetricCard value="1,539" label="Source Records" subtitle="Processed" tooltip="Total raw records from all ERPs across all domains" />
            <MetricCard value="4" label="ERPs Linked" subtitle="Per record" tooltip="Maximum number of ERP sources per golden record" />
            <MetricCard value="100%" label="Traceability" subtitle="Full lineage" tooltip="Every field traced to its source ERP and transformation step" />
          </>
        ) : isProduct ? (
          <>
            <MetricCard value="834" label="Golden Records" subtitle="Unique products" tooltip="Unique products after deduplication" />
            <MetricCard value="851" label="Source Records" subtitle="Processed" tooltip="Total raw product records from all ERPs" />
            <MetricCard value="4" label="ERPs Linked" subtitle="Per record" tooltip="Maximum number of ERP sources per golden record" />
            <MetricCard value="100%" label="Traceability" subtitle="Full lineage" tooltip="Every field traced to its source ERP and transformation step" />
          </>
        ) : (
          <>
            <MetricCard value="488" label="Golden Records" subtitle="Unique customers" tooltip="Unique entities after deduplication" />
            <MetricCard value="688" label="Source Records" subtitle="Processed" tooltip="Total raw customer records from all ERPs" />
            <MetricCard value="4" label="ERPs Linked" subtitle="Per record" tooltip="Maximum number of ERP sources per golden record" />
            <MetricCard value="100%" label="Traceability" subtitle="Full lineage" tooltip="Every field traced to its source ERP and transformation step" />
          </>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name, Golden ID, or source ID..." className="pl-10" />
      </div>

      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <SortHeader label="ID" sortKey={idKey} currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              {isAll && <SortHeader label="Type" sortKey="_type" currentSort={sortKey} dir={sortDir} onSort={handleSort} />}
              <SortHeader label="Golden Name" sortKey={nameKey} currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              {countryKey && <SortHeader label="Country" sortKey={countryKey} currentSort={sortKey} dir={sortDir} onSort={handleSort} />}
              <SortHeader label="Source" sortKey={sourceKey} currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Quality" sortKey={qualityKey} currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              {sizeKey && <SortHeader label="Size" sortKey={sizeKey} currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" />}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50 w-8" />
            </tr>
          </thead>
          <tbody>
            {paged.map((rec, i) => {
              const globalIdx = page * pageSize + i;
              return (
                <tr key={globalIdx} onClick={() => setSelectedIdx(globalIdx)} className="cursor-pointer border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">{String(getField(rec, idKey))}</td>
                  {isAll && <td className="px-4 py-4"><span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold text-white', rec._type === 'Customer' ? 'bg-blue-500' : 'bg-purple-500')}>{String(rec._type)}</span></td>}
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{String(getField(rec, nameKey))}</td>
                  {countryKey && <td className="px-4 py-4 text-gray-500">{String(getField(rec, countryKey))}</td>}
                  <td className="px-4 py-4"><ERPBadge system={String(getField(rec, sourceKey))} /></td>
                  <td className="px-4 py-4"><StatusBadge status={String(getField(rec, qualityKey))} /></td>
                  {sizeKey && <td className="px-4 py-4 text-right text-gray-500">{String(getField(rec, sizeKey))}</td>}
                  <td className="px-4 py-4 w-8"><ChevronRight size={14} className="text-gray-400" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-700/50">
            <span className="text-xs text-gray-400">Page {page + 1} of {totalPages} ({filtered.length} records)</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Detail Page ── */
function DetailPage({ record, recId, recName, recSource, recQuality, isProduct, idKey, nameKey, sourceKey, silverData, onBack }: {
  record: Record<string, unknown>; recId: string; recName: string; recSource: string; recQuality: string;
  isProduct: boolean; idKey: string; nameKey: string; sourceKey: string;
  silverData: Record<string, unknown>[]; onBack: () => void;
}) {
  const [tab, setTab] = useState<'details' | 'audit'>('details');

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3 transition-colors">
          <ArrowLeft size={15} /> Back to Golden Records
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{recName}</h2>
          <span className="text-sm text-gray-400 font-mono">{recId}</span>
          <StatusBadge status={recQuality} />
          <ERPBadge system={recSource} />
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={[{ id: 'details', label: 'Record Details' }, { id: 'audit', label: 'Audit Trail' }]}
        activeTab={tab}
        onTabChange={(id) => setTab(id as 'details' | 'audit')}
      />

      {/* Tab content */}
      {tab === 'details' && <RecordDetail record={record} isProduct={isProduct} />}
      {tab === 'audit' && <AuditTrail record={record} idKey={idKey} nameKey={nameKey} silverData={silverData} isProduct={isProduct} sourceKey={sourceKey} />}
    </div>
  );
}

/* ── Sort header ── */
function SortHeader({ label, sortKey: sk, currentSort, dir, onSort, align = 'left' }: {
  label: string; sortKey: string; currentSort: string; dir: string; onSort: (k: string) => void; align?: 'left' | 'right';
}) {
  const isActive = currentSort === sk;
  return (
    <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors', align === 'right' ? 'text-right' : 'text-left')} onClick={() => onSort(sk)}>
      <span className="inline-flex items-center gap-1">{label}<ArrowUpDown size={11} className={isActive ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'} /></span>
    </th>
  );
}

/* ── Record Detail ── */
function RecordDetail({ record, isProduct }: { record: Record<string, unknown>; isProduct: boolean }) {
  const displayFields = isProduct ? PRODUCT_DISPLAY_FIELDS : CUSTOMER_DISPLAY_FIELDS;
  const sourceKey = isProduct ? 'Primary Source' : 'Primary Source ERP';
  const qualityKey = isProduct ? 'Quality' : 'Quality Flag';
  const idKey = isProduct ? 'GPID' : 'Global Customer ID';
  const primarySource = String(getField(record, sourceKey));

  const fieldEntries = displayFields
    .map(f => { const val = getField(record, f); return val !== '' && val !== undefined ? { field: f, value: String(val) } : null; })
    .filter(Boolean) as { field: string; value: string }[];

  const completeness = fieldEntries.length;
  const totalFields = displayFields.length;
  const linkedSystems = [primarySource];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Field</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Value</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Source</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">
                  <span className="inline-flex items-center gap-1">Why <InfoTooltip text="Survivorship rule that determined which source's value was chosen" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {fieldEntries.map((entry, i) => {
                const isSys = entry.field.toLowerCase().includes('id') || entry.field.toLowerCase().includes('cluster') || entry.field.toLowerCase().includes('quality') || entry.field.toLowerCase().includes('cross') || entry.field.toLowerCase().includes('# source');
                return (
                  <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30">
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-500">{entry.field}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100 max-w-[220px] truncate">{entry.value}</td>
                    <td className="px-5 py-3.5">{isSys ? <span className="text-xs text-gray-400">—</span> : <ERPBadge system={primarySource} />}</td>
                    <td className="px-5 py-3.5"><RuleTag fieldName={entry.field} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Record Profile</h3>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Completeness</span><span>{completeness}/{totalFields}</span></div>
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(completeness / totalFields) * 100}%` }} /></div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Linked Systems ({linkedSystems.length}/4)</p>
              <div className="flex gap-1.5 flex-wrap">
                {['SAP', 'Oracle', 'Epicor', 'Infor'].map(erp => (
                  <span key={erp} className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', linkedSystems.includes(erp) ? 'text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400')} style={linkedSystems.includes(erp) ? { backgroundColor: ERP_COLORS[erp] } : undefined}>{erp}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Quality Status</p>
              <StatusBadge status={String(getField(record, qualityKey) || 'VALID')} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Change Log</h3>
            <div className="space-y-3 text-xs">
              <LogEntry text="Golden record created — initial match and election" date="2024-01-15" />
              <LogEntry text="Fields resolved via survivorship rules" date="2024-01-15" />
              <LogEntry text="Quality validation passed" date="2024-01-15" />
            </div>
          </div>
        </div>
      </div>

      {/* Cross-System ID Mapping */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cross-System ID Mapping</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr>
            {['Golden ID', 'SAP ID', 'Oracle ID', 'Epicor ID', 'Infor ID'].map(h => (
              <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">{h}</th>
            ))}
          </tr></thead>
          <tbody><tr>
            <td className="px-5 py-2.5 font-mono text-xs font-medium text-gray-900 dark:text-gray-100">{String(getField(record, idKey))}</td>
            {['SAP', 'Oracle', 'Epicor', 'Infor'].map(erp => (
              <td key={erp} className="px-5 py-2.5 font-mono text-xs text-gray-500">{primarySource === erp ? String(getField(record, isProduct ? 'Product ID' : 'Source Cust ID')) : '—'}</td>
            ))}
          </tr></tbody>
        </table>
      </div>
    </div>
  );
}

function LogEntry({ text, date }: { text: string; date: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
      <div><p className="text-gray-700 dark:text-gray-300">{text}</p><p className="text-gray-400 mt-0.5">{date}</p></div>
    </div>
  );
}

/* ── Audit Trail ── */
function AuditTrail({ record, idKey, nameKey, silverData, isProduct, sourceKey }: {
  record: Record<string, unknown>; idKey: string; nameKey: string;
  silverData: Record<string, unknown>[]; isProduct: boolean; sourceKey: string;
}) {
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
  const recordId = String(getField(record, idKey));
  const recordName = String(getField(record, nameKey));
  const primarySource = String(getField(record, sourceKey));

  const auditRow = silverData.find(r => {
    const vals = Object.values(r).map(v => String(v));
    return vals.includes(recordId) || vals.some(v => v === recordName);
  });
  const auditKeys = auditRow ? Object.keys(auditRow) : [];

  const toggleStage = (stage: string) => {
    setCollapsedStages(prev => { const next = new Set(prev); if (next.has(stage)) next.delete(stage); else next.add(stage); return next; });
  };
  const isStageExpanded = (stage: string) => !collapsedStages.has(stage);

  return (
    <div className="space-y-4">
      <StageCard stage="BRONZE" title="Raw Ingestion" summary={`Ingested from ${primarySource} as "${recordName}".`} expanded={isStageExpanded('bronze')} onToggle={() => toggleStage('bronze')} color="bg-amber-500">
        <div className="p-5 text-sm grid grid-cols-2 gap-4">
          <div><span className="text-gray-500">Record ID:</span> <span className="font-medium ml-2">{recordId}</span></div>
          <div><span className="text-gray-500">Source ERP:</span> <span className="font-medium ml-2">{primarySource}</span></div>
          <div><span className="text-gray-500">Raw Name:</span> <span className="font-medium ml-2">{recordName}</span></div>
          <div><span className="text-gray-500">Status:</span> <span className="font-medium ml-2 text-emerald-600">Ingested</span></div>
        </div>
      </StageCard>

      <StageCard stage="SILVER" title="Cleaning Pipeline" summary={auditRow ? `${auditKeys.filter(k => /^S\d/.test(k)).length} transformation steps applied.` : 'Cleaning pipeline applied.'} expanded={isStageExpanded('silver')} onToggle={() => toggleStage('silver')} color="bg-slate-400">
        {auditRow ? (
          <table className="w-full text-sm">
            <thead><tr><th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Step</th><th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Result</th></tr></thead>
            <tbody>
              {auditKeys.filter(k => !['Row ID', idKey].includes(k)).slice(0, 20).map((key, i) => {
                const val = String(auditRow[key as keyof typeof auditRow] ?? '');
                const isStep = /^S\d/.test(key);
                const hasChange = val && val !== '' && val !== '-' && val.toLowerCase() !== 'no';
                return (
                  <tr key={i} className={cn(isStep && hasChange ? 'bg-orange-50/50 dark:bg-orange-950/10' : '')}>
                    <td className="px-5 py-2 text-xs font-medium text-gray-500">{key}</td>
                    <td className="px-5 py-2 text-gray-900 dark:text-gray-100 text-xs">{val || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="p-5 text-sm text-gray-500">No detailed audit trail available.</div>}
      </StageCard>

      <StageCard stage="GOLD" title="Match & Election" summary={`Elected as golden record. ${recordId} assigned.`} expanded={isStageExpanded('gold')} onToggle={() => toggleStage('gold')} color="bg-yellow-500">
        <div className="p-5 text-sm space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-gray-500">Golden ID:</span> <span className="font-medium ml-2">{recordId}</span></div>
            <div><span className="text-gray-500">Primary Source:</span> <span className="ml-2"><ERPBadge system={primarySource} /></span></div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">Election Reason:</span> Highest quality score + source trust ranking ({primarySource}) + name completeness</p>
          </div>
        </div>
      </StageCard>
    </div>
  );
}

function StageCard({ stage, title, summary, expanded, onToggle, color, children }: {
  stage: string; title: string; summary: string; expanded: boolean; onToggle: () => void; color: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden">
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <div className={cn('w-3 h-3 rounded-full', color)} />
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage} — {title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{summary}</p>
        </div>
      </button>
      {expanded && <div className="border-t border-gray-100 dark:border-slate-700/50">{children}</div>}
    </div>
  );
}

/* ── Organisation View ── */
function OrgGoldenView() {
  const tree = orgData.tree[0];
  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700/50">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Organisation Golden Records</h3>
        <p className="text-xs text-gray-500">{orgData.dashboard.goidsAssigned} Global Organisation IDs assigned</p>
      </div>
      <table className="w-full text-sm">
        <thead><tr>
          {['GOID', 'Unit', 'Level', 'ERP'].map(h => (
            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">{h}</th>
          ))}
        </tr></thead>
        <tbody>
          <tr className="border-b border-gray-50 dark:border-slate-700/30">
            <td className="px-5 py-3 font-mono text-xs">{tree.goid}</td>
            <td className="px-5 py-3 font-medium">{tree.unit}</td>
            <td className="px-5 py-3 text-gray-500">{tree.level}</td>
            <td className="px-5 py-3">—</td>
          </tr>
          {tree.children.map((child, i) => (
            <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30">
              <td className="px-5 py-3 font-mono text-xs">{child.goid}</td>
              <td className="px-5 py-3 font-medium pl-8">{child.unit}</td>
              <td className="px-5 py-3 text-gray-500">Business Unit</td>
              <td className="px-5 py-3">{'erp' in child && <ERPBadge system={child.erp as string} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
