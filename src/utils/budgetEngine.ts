// ─────────────────────────────────────────────────────────────────────────────
// Tyohar AI — Deterministic Budget Engine
// Pure math — no network calls, no GenAI, 100% testable with Vitest.
// All monetary values are in INR (₹).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EventType,
  SmartPlateCalculation,
  PriorityWeights,
  BudgetCategory,
  TradeOffOption,
} from '../types/tyohar';

// ─────────────────────────────────────────────────────────────────────────────
// Constants — realistic Indian event benchmarks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expected attendance percentages by event type.
 * Based on Indian catering-industry rules of thumb:
 *   Wedding:   85–92% (large guest lists, distant relatives may skip)
 *   Birthday:  90–95% (smaller, closer circle, higher show-up rate)
 *   Community: 70–85% (open events, weather-dependent, walk-in variance)
 */
const TURNOUT_RANGE: Record<EventType, { low: number; high: number }> = {
  wedding:   { low: 85, high: 92 },
  birthday:  { low: 90, high: 95 },
  community: { low: 70, high: 85 },
};

/**
 * Peak / auspicious-date bump: when the event falls on a muhurat weekend,
 * Dussehra, or peak-wedding season, attendance skews higher.
 */
const PEAK_BUMP_PERCENT = 3;

/**
 * Buffer plate percentages: extra plates negotiated with the caterer
 * at a discounted rate to cover last-minute walk-ins.
 */
const BUFFER_RANGE: Record<EventType, { low: number; high: number }> = {
  wedding:   { low: 8, high: 12 },
  birthday:  { low: 5, high: 8 },
  community: { low: 10, high: 15 },
};

/**
 * Guest-scaling categories — their allocation scales linearly with guest count.
 * All other categories are treated as fixed / semi-fixed.
 */
const GUEST_SCALING_CATEGORIES = new Set([
  'Food & Catering',
  'Venue',
]);

/**
 * Default category templates when building a plan from scratch.
 * Each entry maps to a key in PriorityWeights.
 */
const CATEGORY_WEIGHT_KEY: Record<string, keyof PriorityWeights> = {
  'Food & Catering': 'food',
  'Décor & Flowers': 'decor',
  'Venue': 'venue',
  'Photography & Video': 'photography',
  'Entertainment & Music': 'entertainment',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Smart Plate Calculator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates realistic Indian attendance buffer, guaranteed base plates,
 * negotiated buffer plates, exact ₹ savings vs. naïve 100% ordering, and a
 * zero-waste surplus redistribution checklist when buffer > 15 plates.
 */
export function calculateSmartPlateBuffer(
  invitedGuests: number,
  eventType: EventType,
  isAuspiciousOrPeakWeekend: boolean,
  perPlateCostINR: number,
): SmartPlateCalculation {
  // Clamp inputs to sane ranges
  const guests = Math.max(1, Math.round(invitedGuests));
  const plateCost = Math.max(0, perPlateCostINR);

  // Determine turnout band
  const { low: turnoutLow, high: turnoutHigh } = TURNOUT_RANGE[eventType];
  // Use midpoint, then bump if peak date
  let expectedTurnoutPercent =
    Math.round((turnoutLow + turnoutHigh) / 2) +
    (isAuspiciousOrPeakWeekend ? PEAK_BUMP_PERCENT : 0);
  // Cap at 100%
  expectedTurnoutPercent = Math.min(expectedTurnoutPercent, 100);

  const guaranteedBasePlates = Math.ceil(
    (guests * expectedTurnoutPercent) / 100,
  );

  // Buffer plates
  const { low: bufLow, high: bufHigh } = BUFFER_RANGE[eventType];
  const bufferPercent = (bufLow + bufHigh) / 2;
  const bufferPlates = Math.ceil((guaranteedBasePlates * bufferPercent) / 100);

  // Savings = cost of plates we did NOT order (invited − base − buffer)
  const platesNotOrdered = Math.max(
    0,
    guests - guaranteedBasePlates - bufferPlates,
  );
  const estimatedSavingsINR = platesNotOrdered * plateCost;

  // Surplus redistribution plan (activated when buffer > 15)
  const surplusRedistributionPlan: string[] = [];
  if (bufferPlates > 15) {
    surplusRedistributionPlan.push(
      'Step 1 — Pack & Distribute: Arrange takeaway containers and distribute surplus meals to event staff, security, and drivers on-site.',
      'Step 2 — Community Share: Coordinate with a local NGO or community kitchen (e.g., Robin Hood Army) for same-day pickup of sealed surplus food.',
      'Step 3 — Compost Responsibly: Any food that cannot be redistributed should be sent to a composting facility rather than landfill — confirm with your venue\'s waste-management partner.',
    );
  }

  return {
    invitedGuests: guests,
    expectedTurnoutPercent,
    guaranteedBasePlates,
    bufferPlates,
    estimatedSavingsINR,
    surplusRedistributionPlan,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Budget Allocation Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proportionally (re-)allocates the total budget across categories based on
 * priority weights, then scales guest-dependent categories by guest count.
 *
 * @param totalBudget       Total event budget in INR.
 * @param guestCount        Expected guest count.
 * @param weights           User-assigned 1–5 priority weights.
 * @param currentCategories Existing categories (may be empty for new plans).
 * @returns Updated BudgetCategory array with recalculated allocations.
 */
export function recalculateBudgetAllocations(
  totalBudget: number,
  guestCount: number,
  weights: PriorityWeights,
  currentCategories: BudgetCategory[],
): BudgetCategory[] {
  const budget = Math.max(0, totalBudget);
  const guests = Math.max(1, Math.round(guestCount));

  // If no categories exist, bootstrap defaults
  const categories: BudgetCategory[] =
    currentCategories.length > 0
      ? currentCategories.map((c) => ({ ...c }))
      : buildDefaultCategories();

  // Sum of all priority weights
  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0) || 1;

  // Pass 1 — proportional allocation by weight
  for (const cat of categories) {
    const weightKey = CATEGORY_WEIGHT_KEY[cat.name];
    const w = weightKey ? weights[weightKey] : 3; // default mid-weight
    cat.priority = w;
    cat.allocatedAmount = Math.round((budget * w) / totalWeight);
  }

  // Pass 2 — scale guest-dependent categories
  // We use a reference baseline of 100 guests; if actual guests differ,
  // the allocation scales proportionally.
  const BASELINE_GUESTS = 100;
  const guestMultiplier = guests / BASELINE_GUESTS;

  for (const cat of categories) {
    if (cat.isConfirmedQuote) {
      // Confirmed quotes have locked prices — do not overwrite estimatedCost
      continue;
    }
    if (GUEST_SCALING_CATEGORIES.has(cat.name)) {
      cat.estimatedCost = Math.round(cat.allocatedAmount * guestMultiplier);
    } else {
      cat.estimatedCost = cat.allocatedAmount;
    }
  }

  return categories;
}

/** Creates default category stubs for a brand-new plan. */
function buildDefaultCategories(): BudgetCategory[] {
  return [
    { id: 'cat-food',       name: 'Food & Catering',       allocatedAmount: 0, estimatedCost: 0, isConfirmedQuote: false, priority: 5, notes: '' },
    { id: 'cat-decor',      name: 'Décor & Flowers',       allocatedAmount: 0, estimatedCost: 0, isConfirmedQuote: false, priority: 3, notes: '' },
    { id: 'cat-venue',      name: 'Venue',                 allocatedAmount: 0, estimatedCost: 0, isConfirmedQuote: false, priority: 4, notes: '' },
    { id: 'cat-photo',      name: 'Photography & Video',   allocatedAmount: 0, estimatedCost: 0, isConfirmedQuote: false, priority: 3, notes: '' },
    { id: 'cat-entertain',  name: 'Entertainment & Music', allocatedAmount: 0, estimatedCost: 0, isConfirmedQuote: false, priority: 2, notes: '' },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Over-Budget Trade-Off Generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * When estimated expenses exceed the budget, generates actionable trade-off
 * options that target the **lowest-priority** categories first, protecting
 * the user's top priorities.
 *
 * @returns An object containing the overage amount, overage percentage,
 *          and a ranked list of trade-off options.
 */
export function generateOverBudgetTradeOffs(
  totalBudget: number,
  categories: BudgetCategory[],
  weights: PriorityWeights,
): {
  overageAmount: number;
  overagePercent: number;
  options: TradeOffOption[];
} {
  const totalEstimated = categories.reduce(
    (sum, c) => sum + c.estimatedCost,
    0,
  );
  const overageAmount = Math.max(0, totalEstimated - totalBudget);
  const overagePercent =
    totalBudget > 0
      ? Math.round((overageAmount / totalBudget) * 100)
      : 0;

  // No overage — nothing to suggest
  if (overageAmount <= 0) {
    return { overageAmount: 0, overagePercent: 0, options: [] };
  }

  // Sort categories by priority ascending (lowest priority = cut first)
  const sorted = [...categories].sort((a, b) => a.priority - b.priority);

  const options: TradeOffOption[] = [];
  let idCounter = 0;

  for (const cat of sorted) {
    // Skip categories with confirmed quotes (already negotiated)
    if (cat.isConfirmedQuote) continue;
    // Skip categories with zero estimated cost
    if (cat.estimatedCost <= 0) continue;

    // Propose trimming this category by 15–30% depending on overage severity
    const trimPercent = overagePercent > 25 ? 30 : 15;
    const savingsAmount = Math.round(cat.estimatedCost * (trimPercent / 100));

    if (savingsAmount <= 0) continue;

    const weightKey = CATEGORY_WEIGHT_KEY[cat.name];
    const priorityLabel = weightKey
      ? `Priority ${weights[weightKey]}/5`
      : 'Unweighted';

    options.push({
      id: `tradeoff-${++idCounter}`,
      title: `Reduce ${cat.name} by ${trimPercent}%`,
      categoryAffected: cat.name,
      savingsAmount,
      impactDescription: getImpactDescription(cat.name, trimPercent),
      recommendedForPriority: priorityLabel,
    });
  }

  return { overageAmount, overagePercent, options };
}

/**
 * Human-readable impact descriptions for common category trims.
 */
function getImpactDescription(categoryName: string, trimPercent: number): string {
  const descriptions: Record<string, string> = {
    'Food & Catering': `Reduce menu variety or switch to a buffet-only format (saving ~${trimPercent}% on per-plate cost). Consider fewer live counters.`,
    'Décor & Flowers': `Use seasonal local flowers instead of imported ones, reduce floral installations by ${trimPercent}%. Consider LED accents over fresh flower walls.`,
    'Venue': `Negotiate off-peak timing (weekday / afternoon) for a ${trimPercent}% discount, or explore community halls with comparable amenities.`,
    'Photography & Video': `Opt for a single-photographer package instead of duo, skip drone coverage, reduce ${trimPercent}% by limiting pre-event shoots.`,
    'Entertainment & Music': `Switch from a live band to a professional DJ setup, reducing costs by ~${trimPercent}%. Consider fewer hours of live performance.`,
  };

  return (
    descriptions[categoryName] ??
    `Reduce spending on ${categoryName} by ${trimPercent}% — review line items with your vendor for specific cuts.`
  );
}

