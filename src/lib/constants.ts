import type { ScreenConfig, MasterFilterOption } from '@/types';

export const ERP_COLORS: Record<string, string> = {
  SAP: '#3B82F6',
  Oracle: '#F97316',
  Epicor: '#8B5CF6',
  Infor: '#06B6D4',
};

export const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  DELETE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  ARCHIVE: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  REVIEW: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  RECLASSIFY: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  ENRICH: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  VALID: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  SUSPECT: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  INVALID: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  HIGH: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  MEDIUM: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  LOW: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
};

export const MASTER_FILTERS: MasterFilterOption[] = [
  { id: 'all', label: 'All', icon: 'LayoutGrid' },
  { id: 'customer', label: 'Customer', icon: 'Users' },
  { id: 'product', label: 'Product', icon: 'Package' },
  { id: 'organisation', label: 'Organisation', icon: 'Building2' },
];

export const SCREENS: ScreenConfig[] = [
  { id: 'executiveImpact', label: 'Executive Impact', icon: 'BarChart3', group: 'OVERVIEW' },
  { id: 'dataLandscape', label: 'Data Landscape', icon: 'Map', group: 'OVERVIEW' },
  { id: 'matchingEngine', label: 'Matching Engine', icon: 'GitMerge', group: 'PROCESS' },
  { id: 'dataQuality', label: 'Data Quality', icon: 'AlertCircle', group: 'PROCESS' },
  { id: 'survivorshipRules', label: 'Survivorship Rules', icon: 'Scale', group: 'OUTPUT' },
  { id: 'goldenRecord', label: 'Golden Record', icon: 'Award', group: 'OUTPUT' },
];

export const SCREEN_GROUPS = ['OVERVIEW', 'PROCESS', 'OUTPUT'] as const;

export const SUBTITLES: Record<string, Record<string, string>> = {
  executiveImpact: {
    all: 'AED 763.4M revenue across 4 ERPs — 3 data domains — 12 countries',
    customer: 'Customer Master — 688 source records — 488 golden records',
    product: 'Product Master — 851 source records — 834 golden records',
    organisation: 'Organisation — 4 business units — 4 ERPs mapped',
  },
  dataLandscape: {
    all: '4 connected systems — 1,539 total records — 12 countries',
    customer: 'Customer Master — 688 records across 4 ERPs',
    product: 'Product Master — 851 records across 4 ERPs',
    organisation: 'Organisation — 4 business units — 10 GOIDs',
  },
  matchingEngine: {
    all: '200 customer duplicates + 17 product duplicates resolved',
    customer: 'Customer Master — 688 source records — 200 duplicates resolved',
    product: 'Product Master — 17 within-source + 6 cross-source matches',
    organisation: 'Organisation — hierarchy mapping view',
  },
  dataQuality: {
    all: '53 total quality issues identified across all domains',
    customer: 'Customer Master — 30 issues flagged for action',
    product: 'Product Master — 23 issues flagged for action',
    organisation: 'Organisation — no quality issues',
  },
  survivorshipRules: {
    all: 'Field-level conflict resolution across all domains',
    customer: 'Customer Master — 7 field rules configured',
    product: 'Product Master — 5 rule-based transformations',
    organisation: 'Organisation — hierarchy mapping rules',
  },
  goldenRecord: {
    all: '1,322 golden records — single source of truth',
    customer: 'Customer Master — 488 golden records with full lineage',
    product: 'Product Master — 834 golden records with full lineage',
    organisation: 'Organisation — 10 GOIDs assigned',
  },
};
