export type MasterFilter = 'all' | 'customer' | 'product' | 'organisation';
export type ScreenId = 'executiveImpact' | 'dataLandscape' | 'matchingEngine' | 'dataQuality' | 'survivorshipRules' | 'goldenRecord';
export type Theme = 'light' | 'dark';

export interface ExplainPayload {
  entityName: string;
  coreNameA: string;
  coreNameB: string;
  sourceA: string;
  sourceB: string;
  country: string;
  scores: { ts: number; tset: number; jacc: number; composite: number };
  matchClass: string;
  matchType: 'exact' | 'fuzzy';
  clusterId: string;
}

export interface AppState {
  theme: Theme;
  activeMaster: MasterFilter;
  activeScreen: ScreenId;
  agentOpen: boolean;
  sidebarCollapsed: boolean;
  explainDrawerOpen: boolean;
}

export interface SourceBreakdown {
  system: string;
  total: number;
  golden: number;
  dupes: number;
  invalid: number;
  dupRate: string;
  valid?: number;
  suspect?: number;
  issues?: number;
}

export interface BeforeAfterRow {
  metric: string;
  before: number | string;
  after: number | string;
  change: string;
}

export interface FieldRule {
  field: string;
  rule: string;
  winner?: string;
  rationale?: string;
  detail?: string;
}

export interface QualityIssue {
  [key: string]: string | number;
}

export interface GroupTreeBranch {
  golden: string;
  revenue: number;
  namesMerged: number;
  members: { name: string; source: string; revenue: number }[];
}

export interface GroupTree {
  name: string;
  totalRaw: number;
  totalGolden: number;
  revenue: number;
  consolidation: string;
  branches: GroupTreeBranch[];
}

export interface HarmonizationRow {
  dimension: string;
  beforeCount: number;
  beforeTopShare: string;
  afterCount: number;
  afterTopShare: string;
  reduction: string;
}

export interface AgentQA {
  question: string;
  answer: string;
}

export interface ScreenConfig {
  id: ScreenId;
  label: string;
  icon: string;
  group: 'OVERVIEW' | 'PROCESS' | 'OUTPUT';
}

export interface MasterFilterOption {
  id: MasterFilter;
  label: string;
  icon: string;
}
