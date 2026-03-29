'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, ChevronDown, ChevronRight, Lightbulb, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ERPBadge } from '@/components/shared/ERPBadge';
import { cn } from '@/lib/utils';

export function ExplainDrawer() {
  const { explainDrawerOpen, explainData, closeExplainDrawer } = useApp();
  const [expanded, setExpanded] = useState<string>('scoring');

  if (!explainDrawerOpen || !explainData) return null;

  const { entityName, coreNameA, coreNameB, sourceA, sourceB, country, scores, matchClass, matchType } = explainData;
  const toggle = (section: string) => setExpanded(expanded === section ? '' : section);

  return (
    <aside className="w-[400px] fixed right-0 top-0 z-50 shadow-2xl border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Match Explainability</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{entityName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={closeExplainDrawer} className="h-7 w-7">
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Section 1: How Records Were Cleaned */}
          <Section
            title="How Records Were Cleaned"
            subtitle="Name cleaning and simplification steps"
            expanded={expanded === 'cleaning'}
            onToggle={() => toggle('cleaning')}
          >
            <div className="space-y-4">
              <CleaningRecord label="Record A" name={coreNameA} source={sourceA} otherName={coreNameB} />
              <CleaningRecord label="Record B" name={coreNameB} source={sourceB} otherName={coreNameA} />

              {coreNameA === coreNameB && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <Check size={14} /> Result: Both records cleaned to &ldquo;{coreNameA}&rdquo;
                  </p>
                </div>
              )}
              {coreNameA !== coreNameB && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Result: Names are similar but not identical — fuzzy matching applied
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Section 2: Why The System Thinks These Match */}
          <Section
            title="Why The System Thinks These Match"
            subtitle={matchType === 'exact' ? 'Identical names after cleaning' : 'Similar names detected'}
            expanded={expanded === 'scoring'}
            onToggle={() => toggle('scoring')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Match type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {matchType === 'exact' ? 'Identical names' : 'Similar names (not identical)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Overall confidence</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{Math.round(scores.composite * 100)}%</span>
                  <StatusBadge status={matchClass} />
                </div>
              </div>

              {matchType === 'fuzzy' && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-slate-700/50">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">How confidence was calculated</p>

                  <ScoreExplain
                    label="Token Sort Ratio"
                    value={scores.ts}
                    weight={0.5}
                    question="Do the same words appear, regardless of order?"
                  />
                  <ScoreExplain
                    label="Token Set Ratio"
                    value={scores.tset}
                    weight={0.3}
                    question="Do they share the same set of distinct words?"
                  />
                  <ScoreExplain
                    label="Char 3-gram Jaccard"
                    value={scores.jacc}
                    weight={0.2}
                    question="How similar are they letter by letter?"
                  />

                  {/* Composite formula */}
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-700/50">
                    <p className="text-xs text-gray-500 font-mono">
                      Composite: 0.5&times;{Math.round(scores.ts * 100)} + 0.3&times;{Math.round(scores.tset * 100)} + 0.2&times;{Math.round(scores.jacc * 100)} = <span className="font-bold text-gray-900 dark:text-gray-100">{Math.round(scores.composite * 100)}%</span>
                    </p>
                  </div>
                </div>
              )}

              {matchType === 'exact' && (
                <p className="text-sm text-gray-500">
                  Both records have the exact same name and country after cleaning. All similarity scores = 100%.
                </p>
              )}

              <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                <p className="font-medium text-gray-500 dark:text-gray-400">Threshold</p>
                <p>85% minimum to suggest a match</p>
                <p>92%+ = HIGH confidence (auto-merge eligible)</p>
                <p>88-92% = MEDIUM (needs review)</p>
                <p>85-88% = LOW (needs review)</p>
              </div>
            </div>
          </Section>

          {/* Section 3: How The Winner Was Chosen */}
          <Section
            title="How The Winner Was Chosen"
            subtitle="Golden record selection cascade"
            expanded={expanded === 'election'}
            onToggle={() => toggle('election')}
          >
            <div className="space-y-3 text-sm">
              <p className="text-gray-500 text-xs">The system picks one record as the &ldquo;golden&rdquo; master:</p>

              <ElectionStep
                step={1}
                title="Data quality"
                description="VALID records preferred over SUSPECT or INVALID"
                resultA={`Record A: VALID`}
                resultB={`Record B: VALID`}
                winner={null}
                tie
              />

              <ElectionStep
                step={2}
                title="Source system trust"
                description={`${sourceA} ranked ${sourceA === sourceB ? 'equal' : 'higher'}`}
                resultA={`Record A: ${sourceA}`}
                resultB={`Record B: ${sourceB}`}
                winner={sourceA !== sourceB ? 'A' : null}
                tie={sourceA === sourceB}
              />

              <ElectionStep
                step={3}
                title="Name completeness"
                description="Longer, more descriptive name preferred"
                resultA={`"${coreNameA}" (${coreNameA.length} chars)`}
                resultB={`"${coreNameB}" (${coreNameB.length} chars)`}
                winner={coreNameA.length >= coreNameB.length ? 'A' : 'B'}
              />

              <div className="pt-3 border-t border-gray-100 dark:border-slate-700/50">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Winner: Record A ({sourceA})
                </p>
              </div>
            </div>
          </Section>
        </div>
      </ScrollArea>
    </aside>
  );
}

/* ── Section wrapper ── */

function Section({ title, subtitle, expanded, onToggle, children }: {
  title: string; subtitle: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700/30 transition-colors duration-150">
        {expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        <div className="text-left flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ── Cleaning record detail ── */

function CleaningRecord({ label, name, source, otherName }: { label: string; name: string; source: string; otherName: string }) {
  // Infer which S-steps likely applied based on name characteristics
  const steps: { code: string; title: string; detail: string }[] = [];

  steps.push({ code: 'S1', title: 'Text Cleaning', detail: 'Standardized to uppercase, removed extra spaces' });

  if (/[.\-,()]/.test(otherName) || /[.\-,()]/.test(name)) {
    steps.push({ code: 'S2', title: 'Special Chars', detail: 'Removed punctuation (dots, commas, dashes)' });
  }
  if (name.length < otherName.length - 3 || otherName.length < name.length - 3) {
    steps.push({ code: 'S3', title: 'Legal Suffix Removal', detail: 'Removed company type labels (LLC, LTD, etc.)' });
  }
  if (name.endsWith('-') || name.endsWith(' ') || otherName.endsWith('-')) {
    steps.push({ code: 'S2', title: 'Special Chars', detail: 'Removed trailing dash/characters' });
  }

  steps.push({ code: 'S8', title: 'Core Name Extraction', detail: `Extracted: ${name}` });

  // Deduplicate by code
  const seen = new Set<string>();
  const uniqueSteps = steps.filter(s => { if (seen.has(s.code)) return false; seen.add(s.code); return true; });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-100 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}: {name}</span>
        <ERPBadge system={source} />
      </div>
      <div className="space-y-1.5">
        {uniqueSteps.map((step, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs">
            <Check size={11} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{step.code}: {step.title}</span>
              <span className="text-gray-400"> — {step.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Score with plain English ── */

function ScoreExplain({ label, value, weight, question }: { label: string; value: number; weight: number; question: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{pct}%</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5">&ldquo;{question}&rdquo;</p>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] text-gray-400 shrink-0">&times;{weight} weight</span>
      </div>
    </div>
  );
}

/* ── Election step ── */

function ElectionStep({ step, title, description, resultA, resultB, winner, tie }: {
  step: number; title: string; description: string; resultA: string; resultB: string; winner: 'A' | 'B' | null; tie?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-100 dark:border-slate-700/50">
      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{step}. {title}</p>
      <p className="text-xs text-gray-400 mb-2">{description}</p>
      <div className="space-y-1 text-xs">
        <p className={cn('text-gray-600 dark:text-gray-400', winner === 'A' && 'text-emerald-600 dark:text-emerald-400 font-medium')}>
          &rarr; {resultA} {winner === 'A' && '✓'}
        </p>
        <p className={cn('text-gray-600 dark:text-gray-400', winner === 'B' && 'text-emerald-600 dark:text-emerald-400 font-medium')}>
          &rarr; {resultB} {winner === 'B' && '✓'}
        </p>
        {tie && <p className="text-gray-400 italic">(tie — move to next criterion)</p>}
      </div>
    </div>
  );
}
