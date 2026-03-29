'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ERPBadge } from '@/components/shared/ERPBadge';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import orgData from '@/data/organisation.json';

const CUSTOMER_RESOLUTION_OPTIONS = [
  'Highest Completeness',
  'Most Recent',
  'Most Frequent Value',
  'SAP Preferred',
  'Oracle Preferred',
  'Epicor Preferred',
  'Infor Preferred',
];

const PRODUCT_RESOLUTION_OPTIONS = [
  'Dictionary Normalization',
  'Hierarchy Mapping',
  'Regex Extraction',
  'Code Prefix Detection',
  'Rule-based Classification',
];

const CUSTOMER_RULES = [
  { field: 'Customer Name', rule: 'Highest Completeness', tag: 'Longest Name', tip: 'Selects the longest, most complete legal name' },
  { field: 'Country', rule: 'SAP Preferred', tag: 'ISO Standard', tip: 'SAP uses ISO standardized country codes' },
  { field: 'Phone', rule: 'Most Recent', tag: 'Latest Update', tip: 'Most recently updated contact data wins' },
  { field: 'Address', rule: 'Oracle Preferred', tag: 'Most Complete', tip: 'Oracle address records have highest completeness' },
  { field: 'Segment', rule: 'Most Frequent Value', tag: '3 of 4 Systems', tip: 'Value appearing in most source systems wins' },
  { field: 'Region', rule: 'SAP Preferred', tag: 'Official Hierarchy', tip: 'SAP maintains the official regional structure' },
  { field: 'Channel', rule: 'Most Recent', tag: 'Latest Update', tip: 'Most recently assigned channel wins' },
];

const PRODUCT_RULES = [
  { field: 'Brand', rule: 'Dictionary Normalization', tag: '40+ Variants', tip: 'Raw brand variants mapped to canonical names via dictionary' },
  { field: 'Category', rule: 'Hierarchy Mapping', tag: '5-Level Tree', tip: 'Source codes mapped to enterprise product hierarchy' },
  { field: 'Pack Size', rule: 'Regex Extraction', tag: 'Pattern Match', tip: 'Pack size extracted from product descriptions via regex' },
  { field: 'Product Family', rule: 'Code Prefix Detection', tag: 'ID Prefix', tip: 'Product ID prefix determines type (FG, RM, etc.)' },
  { field: 'Quality Flag', rule: 'Rule-based Classification', tag: 'Auto-Flagged', tip: 'Invalid if rebate/service; incomplete if missing fields' },
];

function RationaleTag({ tag, tip }: { tag: string; tip: string }) {
  return (
    <span className="relative group">
      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-help whitespace-nowrap">
        {tag}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-[11px] leading-relaxed text-gray-100 bg-gray-800 dark:bg-gray-700 rounded-lg max-w-[260px] z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
        {tip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
      </span>
    </span>
  );
}

export function SurvivorshipRules() {
  const { activeMaster } = useApp();

  if (activeMaster === 'organisation') {
    return <OrgHierarchyView />;
  }

  const isProduct = activeMaster === 'product';

  return (
    <div className="space-y-7">
      {/* Tiebreaker line */}
      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        Tiebreaker priority: <span className="font-medium text-gray-700 dark:text-gray-300">SAP &gt; Oracle &gt; Epicor &gt; Infor</span>
        <InfoTooltip text="When two sources score equally on a resolution rule, the tiebreaker priority determines which source wins." />
      </div>

      {/* Full-width rules table */}
      {isProduct ? <ProductRulesTable /> : <CustomerRulesTable />}
    </div>
  );
}

function CustomerRulesTable() {
  const [rules, setRules] = useState(CUSTOMER_RULES.map(r => ({ ...r, currentRule: r.rule })));

  const handleRuleChange = (idx: number, newRule: string) => {
    setRules(prev => prev.map((r, i) => i === idx ? { ...r, currentRule: newRule } : r));
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Field</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">
              <span className="inline-flex items-center gap-1">
                Resolution Rule
                <InfoTooltip text="The logic used to pick the winning value when multiple source systems have different data for the same field." />
              </span>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Rationale</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, i) => (
            <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{rule.field}</td>
              <td className="px-6 py-4">
                <select
                  value={rule.currentRule}
                  onChange={(e) => handleRuleChange(i, e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors cursor-pointer min-w-[200px]"
                >
                  {CUSTOMER_RESOLUTION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4"><RationaleTag tag={rule.tag} tip={rule.tip} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductRulesTable() {
  const [rules, setRules] = useState(PRODUCT_RULES.map(r => ({ ...r, currentRule: r.rule })));

  const handleRuleChange = (idx: number, newRule: string) => {
    setRules(prev => prev.map((r, i) => i === idx ? { ...r, currentRule: newRule } : r));
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Field</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">
              <span className="inline-flex items-center gap-1">
                Resolution Rule
                <InfoTooltip text="The logic used to pick the winning value when multiple source systems have different data for the same field." />
              </span>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Rationale</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, i) => (
            <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{rule.field}</td>
              <td className="px-6 py-4">
                <select
                  value={rule.currentRule}
                  onChange={(e) => handleRuleChange(i, e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors cursor-pointer min-w-[200px]"
                >
                  {PRODUCT_RESOLUTION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4"><RationaleTag tag={rule.tag} tip={rule.tip} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrgHierarchyView() {
  const tree = orgData.tree[0];

  return (
    <div className="space-y-7">
      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Organisation Hierarchy Mapping</h3>
          <p className="text-xs text-gray-400 mt-1">Business units mapped to ERP systems — no field-level survivorship rules apply</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">ERP</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">Hierarchy</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-700/50">GOID</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 dark:border-slate-700/30 bg-gray-50/30 dark:bg-slate-800/10">
              <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{tree.unit}</td>
              <td className="px-6 py-4 text-gray-400">—</td>
              <td className="px-6 py-4 text-gray-500">Parent Group</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-500">{tree.goid}</td>
            </tr>
            {tree.children.map((child, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
                <td className="px-6 py-4 pl-10 font-medium text-gray-900 dark:text-gray-100">{child.unit}</td>
                <td className="px-6 py-4">{'erp' in child && <ERPBadge system={child.erp as string} />}</td>
                <td className="px-6 py-4 text-gray-500">{'hierarchy' in child ? child.hierarchy as string : 'Business Unit'}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{child.goid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
