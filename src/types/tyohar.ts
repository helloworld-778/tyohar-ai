// ─────────────────────────────────────────────────────────────────────────────
// Tyohar AI — Core Type Definitions
// All interfaces are strict; no `any` types, no optional-by-default fields.
// ─────────────────────────────────────────────────────────────────────────────

/** Supported celebration event categories. */
export type EventType = 'wedding' | 'birthday' | 'community';

/** Vendor package optimisation strategy. */
export type OptimizationMode = 'minimize_cost' | 'balanced' | 'maximize_variety';

/** User-assigned importance weights for each spending category (1–5 scale). */
export interface PriorityWeights {
  food: number;
  decor: number;
  venue: number;
  photography: number;
  entertainment: number;
}

/**
 * Demographic breakdown of expected attendees.
 * Percentages must sum to 100.
 */
export interface DemographicSplit {
  kidsPercent: number;
  adultsPercent: number;
  seniorsPercent: number;
  /** e.g. "Jain", "Vegan", "Halal", "Gluten-Free" */
  dietaryTags: string[];
  /** e.g. "Wheelchair ramp", "Hearing loop", "Low-noise zone" */
  accessibilityNeeds: string[];
}

/** A single row in the budget breakdown table. */
export interface BudgetCategory {
  id: string;
  name: string;
  /** Rupees allocated by the engine proportional to priority weight. */
  allocatedAmount: number;
  /** Vendor-estimated or AI-estimated cost for this category. */
  estimatedCost: number;
  /** True when the number comes from an actual vendor quote. */
  isConfirmedQuote: boolean;
  /** Priority weight snapshot (1–5). */
  priority: number;
  notes: string;
}

/** One actionable cost-saving suggestion generated when budget is exceeded. */
export interface TradeOffOption {
  id: string;
  title: string;
  /** Which BudgetCategory.name is affected. */
  categoryAffected: string;
  savingsAmount: number;
  impactDescription: string;
  /** Which priority profile benefits most, e.g. "food-first" or "decor-first". */
  recommendedForPriority: string;
}

/**
 * Smart Plate Calculator output — the core deterministic meal-planning engine.
 * All monetary values are in INR (₹).
 */
export interface SmartPlateCalculation {
  invitedGuests: number;
  /** Realistic expected attendance percentage (typically 82–95%). */
  expectedTurnoutPercent: number;
  /** Plates ordered for the base-case attendance. */
  guaranteedBasePlates: number;
  /** Extra plates negotiated at a discount for last-moment walk-ins. */
  bufferPlates: number;
  /** Savings vs. ordering plates for 100% of invitees. */
  estimatedSavingsINR: number;
  /** 3-step zero-waste action checklist when buffer > 15 plates. */
  surplusRedistributionPlan: string[];
}

/**
 * AI-generated vendor package comparison row.
 * Three of these (one per OptimizationMode) are presented side-by-side.
 */
export interface VendorPackageOption {
  mode: OptimizationMode;
  title: string;
  estimatedPerPersonINR: number;
  totalEstimatedINR: number;
  menuHighlights: string[];
  arrangementHighlights: string[];
  pros: string[];
  tradeOffs: string[];
}

/** Parsed & scored vendor quote after AI audit. */
export interface VendorQuoteItem {
  id: string;
  vendorName: string;
  category: string;
  quotedTotalINR: number;
  guestsCovered: number;
  inclusions: string[];
  /** e.g. "Service charge 18% not mentioned", "Transport extra" */
  hiddenChargesFlagged: string[];
  /** e.g. "Does price include crockery deposit?" */
  missingClarifications: string[];
  /** 0–100 composite score factoring price, transparency, inclusions. */
  valueScore: number;
}

/** One task in the countdown timeline / Gantt chart. */
export interface TimelineTask {
  id: string;
  title: string;
  /** Maps to BudgetCategory.name for cross-linking. */
  category: string;
  /** Weeks before the event date. 0 = event day. */
  weeksBefore: number;
  status: 'pending' | 'completed' | 'delayed';
  /** IDs of tasks that must finish before this one can start. */
  dependsOn: string[];
  /** Human-readable cascade-risk note. */
  impactIfDelayed: string;
}

/**
 * Multi-Generation Vibe Audit entry.
 * Flags comfort / friction issues per event zone for a target age group.
 */
export interface GenerationVibeAudit {
  /** Physical zone, e.g. "Dance Floor", "Kids Corner", "Dining Hall". */
  zone: string;
  frictionWarning: string;
  accommodationFix: string;
  targetGroup: 'kids' | 'seniors' | 'all';
}

/**
 * Diff object returned by the MUTATE_PLAN_WHAT_IF action to show
 * exactly what changed when a user says "+50 guests, budget -10%".
 */
export interface MutationDiff {
  summary: string;
  previousBudget: number;
  newBudget: number;
  previousGuests: number;
  newGuests: number;
  timelineShifts: string[];
  budgetAdjustments: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite State Object
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level state that holds the entire event plan. */
export interface EventPlan {
  /** Display name of this plan / preset. */
  name: string;
  eventType: EventType;
  eventDate: string;
  totalBudgetINR: number;
  guestCount: number;
  priorityWeights: PriorityWeights;
  demographics: DemographicSplit;
  budgetCategories: BudgetCategory[];
  smartPlate: SmartPlateCalculation;
  vendorPackages: VendorPackageOption[];
  vendorQuotes: VendorQuoteItem[];
  timeline: TimelineTask[];
  vibeAudit: GenerationVibeAudit[];
  tradeOffs: TradeOffOption[];
  mutationHistory: MutationDiff[];
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Service Action Types (used by api/gemini.ts & aiClient.ts)
// ─────────────────────────────────────────────────────────────────────────────

export type AiAction =
  | 'GENERATE_CUSTOM_PLAN'
  | 'OPTIMIZE_VENDOR_MENU'
  | 'AUDIT_VENDOR_QUOTES'
  | 'MUTATE_PLAN_WHAT_IF';

export interface AiRequestPayload {
  action: AiAction;
  /** Arbitrary action-specific input — validated & sanitized before use. */
  data: Record<string, unknown>;
}

export interface AiResponsePayload {
  success: boolean;
  action: AiAction;
  /** Parsed JSON result matching the action's output schema. */
  result: Record<string, unknown>;
  /** Non-empty when success is false. */
  error: string;
  /** True when the response was produced by the deterministic fallback. */
  isFallback: boolean;
}

