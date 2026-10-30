// ─────────────────────────────────────────────────────────────────────────────
// Tyohar AI — Frontend AI Client
// Calls /api/gemini (Vercel serverless) with automatic deterministic fallback.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AiAction,
  AiRequestPayload,
  AiResponsePayload,
  EventPlan,
  PriorityWeights,
  VendorPackageOption,
  TimelineTask,
  MutationDiff,
  EventType,
  GenerationVibeAudit,
} from '../types/tyohar';
import {
  calculateSmartPlateBuffer,
  recalculateBudgetAllocations,
  generateOverBudgetTradeOffs,
} from '../utils/budgetEngine';
import {
  sortTasksByCriticalPath,
  compressTimelineForEarlierDate,
} from '../utils/timelineEngine';
import { sanitizeTextInput, validatePositiveNumber } from '../utils/sanitize';

// ─────────────────────────────────────────────────────────────────────────────
// BYOK (Bring Your Own Key) Session Storage
// ─────────────────────────────────────────────────────────────────────────────

const BYOK_STORAGE_KEY = 'tyohar_ai_byok';
let memoryBYOKKey: string | null = null;

/** Stores a user-supplied API key in sessionStorage (cleared when tab closes). */
export function setBYOKApiKey(key: string): void {
  memoryBYOKKey = key;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(BYOK_STORAGE_KEY, key);
    }
  } catch {
    // Graceful fallback to memory storage
  }
}

/** Retrieves the user-supplied API key from sessionStorage. */
export function getBYOKApiKey(): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(BYOK_STORAGE_KEY);
      if (stored !== null) return stored;
    }
  } catch {
    // Graceful fallback to memory storage
  }
  return memoryBYOKKey;
}

/** Clears the stored BYOK key. */
export function clearBYOKApiKey(): void {
  memoryBYOKKey = null;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(BYOK_STORAGE_KEY);
    }
  } catch {
    // Graceful fallback to memory storage
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Network caller
// ─────────────────────────────────────────────────────────────────────────────

async function callGeminiApi(payload: AiRequestPayload): Promise<AiResponsePayload> {
  const byokKey = getBYOKApiKey();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (byokKey) {
    headers['x-custom-api-key'] = byokKey;
  }

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(
      (errorBody.error as string) ?? `API returned ${response.status}`,
    );
  }

  return (await response.json()) as AiResponsePayload;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Fallback Engine
// Ensures the app NEVER crashes even when AI is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

function deterministicFallback(
  action: AiAction,
  data: Record<string, unknown>,
): AiResponsePayload {
  switch (action) {
    case 'GENERATE_CUSTOM_PLAN':
      return fallbackGeneratePlan(data);
    case 'OPTIMIZE_VENDOR_MENU':
      return fallbackOptimizeMenu(data);
    case 'AUDIT_VENDOR_QUOTES':
      return fallbackAuditQuotes();
    case 'MUTATE_PLAN_WHAT_IF':
      return fallbackMutatePlan(data);
    default:
      return {
        success: false,
        action,
        result: {},
        error: `Unknown action: ${action}`,
        isFallback: true,
      };
  }
}

function fallbackGeneratePlan(data: Record<string, unknown>): AiResponsePayload {
  const eventType = (data.eventType as EventType) ?? 'wedding';
  const totalBudget = validatePositiveNumber(data.totalBudgetINR, 1000, 100_000_000, 100000);
  const guestCount = validatePositiveNumber(data.guestCount, 1, 100000, 100);
  const weights: PriorityWeights = (data.priorityWeights as PriorityWeights) ?? {
    food: 4, decor: 3, venue: 3, photography: 3, entertainment: 2,
  };

  const budgetCategories = recalculateBudgetAllocations(
    totalBudget, guestCount, weights, [],
  );

  const perPlateCost = totalBudget > 0
    ? Math.round((budgetCategories.find((c) => c.name === 'Food & Catering')?.allocatedAmount ?? 0) / Math.max(1, guestCount))
    : 500;

  const smartPlate = calculateSmartPlateBuffer(
    guestCount, eventType, false, perPlateCost,
  );

  const timeline = buildFallbackTimeline(eventType);
  const vibeAudit = buildFallbackVibeAudit();

  const vendorPackages = buildFallbackVendorPackages(guestCount, perPlateCost);
  const { options: tradeOffs } = generateOverBudgetTradeOffs(
    totalBudget, budgetCategories, weights,
  );

  return {
    success: true,
    action: 'GENERATE_CUSTOM_PLAN',
    result: {
      budgetCategories,
      smartPlate,
      timeline,
      vibeAudit,
      vendorPackages,
      tradeOffs,
    } as unknown as Record<string, unknown>,
    error: '',
    isFallback: true,
  };
}

function fallbackOptimizeMenu(data: Record<string, unknown>): AiResponsePayload {
  const guests = validatePositiveNumber(data.guestCount, 1, 100000, 100);
  const baseCost = validatePositiveNumber(data.budgetINR, 0, 100_000_000, 50000);
  const perPerson = Math.round(baseCost / Math.max(1, guests));

  return {
    success: true,
    action: 'OPTIMIZE_VENDOR_MENU',
    result: {
      vendorPackages: buildFallbackVendorPackages(guests, perPerson),
    } as unknown as Record<string, unknown>,
    error: '',
    isFallback: true,
  };
}

function fallbackAuditQuotes(): AiResponsePayload {
  return {
    success: true,
    action: 'AUDIT_VENDOR_QUOTES',
    result: {
      vendorQuotes: [],
      comparisonSummary:
        'AI quote auditing is currently unavailable. Please compare the quotes manually or try again later.',
      negotiationQuestions: [
        'Does the quoted price include GST / service tax?',
        'Are transport and setup charges included?',
        'What is the cancellation and refund policy?',
        'Is crockery/equipment deposit extra?',
        'What happens if guest count changes by ±20%?',
      ],
    },
    error: '',
    isFallback: true,
  };
}

function fallbackMutatePlan(data: Record<string, unknown>): AiResponsePayload {
  const currentPlan = data.currentPlan as EventPlan | undefined;
  const changeDesc = sanitizeTextInput(
    (data.changeDescription as string) ?? '', 500,
  );

  if (!currentPlan) {
    return {
      success: false,
      action: 'MUTATE_PLAN_WHAT_IF',
      result: {},
      error: 'No current plan provided for mutation.',
      isFallback: true,
    };
  }

  // Parse simple mutations from description
  const guestDelta = parseGuestDelta(changeDesc);
  const budgetMultiplier = parseBudgetMultiplier(changeDesc);
  const weeksEarlier = parseWeeksEarlier(changeDesc);

  const newGuests = Math.max(1, currentPlan.guestCount + guestDelta);
  const newBudget = Math.max(1000, Math.round(currentPlan.totalBudgetINR * budgetMultiplier));

  const updatedCategories = recalculateBudgetAllocations(
    newBudget, newGuests, currentPlan.priorityWeights, currentPlan.budgetCategories,
  );

  let updatedTimeline = currentPlan.timeline;
  const timelineShifts: string[] = [];

  if (weeksEarlier > 0) {
    const compressed = compressTimelineForEarlierDate(
      currentPlan.timeline, weeksEarlier,
    );
    updatedTimeline = compressed.updatedTasks;
    timelineShifts.push(...compressed.criticalWarnings);
  }

  const budgetAdjustments: string[] = [];
  if (budgetMultiplier !== 1) {
    const pctChange = Math.round((budgetMultiplier - 1) * 100);
    budgetAdjustments.push(
      `Budget ${pctChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(pctChange)}%`,
    );
  }
  if (guestDelta !== 0) {
    budgetAdjustments.push(
      `Guest count changed by ${guestDelta >= 0 ? '+' : ''}${guestDelta}`,
    );
  }

  const diff: MutationDiff = {
    summary: `Applied changes: "${changeDesc}". Recalculated budget and timeline.`,
    previousBudget: currentPlan.totalBudgetINR,
    newBudget,
    previousGuests: currentPlan.guestCount,
    newGuests,
    timelineShifts,
    budgetAdjustments,
  };

  return {
    success: true,
    action: 'MUTATE_PLAN_WHAT_IF',
    result: {
      mutationDiff: diff,
      updatedBudgetCategories: updatedCategories,
      updatedTimeline,
      warnings: timelineShifts,
    } as unknown as Record<string, unknown>,
    error: '',
    isFallback: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildFallbackTimeline(eventType: EventType): TimelineTask[] {
  const weeks = eventType === 'wedding' ? 16 : eventType === 'community' ? 4 : 2;
  const tasks: TimelineTask[] = [
    {
      id: 'fb-tl-1',
      title: 'Book venue',
      category: 'Venue',
      weeksBefore: weeks,
      status: 'pending',
      dependsOn: [],
      impactIfDelayed: 'Blocks all downstream planning.',
    },
    {
      id: 'fb-tl-2',
      title: 'Confirm caterer & menu',
      category: 'Food & Catering',
      weeksBefore: Math.max(1, weeks - 4),
      status: 'pending',
      dependsOn: ['fb-tl-1'],
      impactIfDelayed: 'Last-minute catering bookings attract premium pricing.',
    },
    {
      id: 'fb-tl-3',
      title: 'Finalise décor and entertainment',
      category: 'Décor & Flowers',
      weeksBefore: Math.max(1, weeks - 6),
      status: 'pending',
      dependsOn: ['fb-tl-1'],
      impactIfDelayed: 'Limited vendor availability for preferred theme.',
    },
    {
      id: 'fb-tl-4',
      title: 'Send invitations & collect RSVPs',
      category: 'Venue',
      weeksBefore: Math.max(1, weeks - 6),
      status: 'pending',
      dependsOn: ['fb-tl-1'],
      impactIfDelayed: 'Inaccurate guest count affects catering & seating.',
    },
    {
      id: 'fb-tl-5',
      title: 'Final walkthrough & setup',
      category: 'Venue',
      weeksBefore: 0,
      status: 'pending',
      dependsOn: ['fb-tl-2', 'fb-tl-3', 'fb-tl-4'],
      impactIfDelayed: 'Event-day chaos if setup not verified.',
    },
  ];
  return sortTasksByCriticalPath(tasks);
}

function buildFallbackVibeAudit(): GenerationVibeAudit[] {
  return [
    {
      zone: 'Main Event Area',
      frictionWarning: 'Noise levels may be uncomfortable for senior guests and young children.',
      accommodationFix: 'Create a quiet zone away from speakers with comfortable seating.',
      targetGroup: 'all',
    },
    {
      zone: 'Dining Area',
      frictionWarning: 'Mixed dietary needs may lead to confusion at food stations.',
      accommodationFix: 'Clearly label all dietary stations (Veg, Jain, Vegan, etc.).',
      targetGroup: 'seniors',
    },
  ];
}

function buildFallbackVendorPackages(
  guests: number,
  basePerPerson: number,
): VendorPackageOption[] {
  const low = Math.max(100, Math.round(basePerPerson * 0.6));
  const mid = Math.max(150, basePerPerson);
  const high = Math.max(200, Math.round(basePerPerson * 1.6));

  return [
    {
      mode: 'minimize_cost',
      title: 'Budget-Friendly Package',
      estimatedPerPersonINR: low,
      totalEstimatedINR: low * guests,
      menuHighlights: ['Standard vegetarian buffet', 'Tea & snacks counter'],
      arrangementHighlights: ['Self-service buffet', 'Disposable eco-friendly crockery'],
      pros: ['Lowest cost', 'Quick service'],
      tradeOffs: ['Limited variety', 'No live counters'],
    },
    {
      mode: 'balanced',
      title: 'Balanced Experience Package',
      estimatedPerPersonINR: mid,
      totalEstimatedINR: mid * guests,
      menuHighlights: ['Multi-cuisine buffet', 'One live counter', 'Dessert station'],
      arrangementHighlights: ['Steel crockery', 'Dietary-labelled stations'],
      pros: ['Good variety', 'Covers dietary needs'],
      tradeOffs: ['Moderate cost', 'Needs additional service staff'],
    },
    {
      mode: 'maximize_variety',
      title: 'Premium Variety Package',
      estimatedPerPersonINR: high,
      totalEstimatedINR: high * guests,
      menuHighlights: ['Multi-cuisine spread', 'Multiple live counters', 'Premium dessert bar'],
      arrangementHighlights: ['Premium crockery', 'Themed food stations'],
      pros: ['Maximum variety', 'Instagram-worthy presentation'],
      tradeOffs: ['Highest cost', 'Extended setup time'],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple NLP parsers for deterministic mutation fallback
// ─────────────────────────────────────────────────────────────────────────────

function parseGuestDelta(text: string): number {
  // Match patterns like "+50 guests", "add 100 guests", "-30 guests", "remove 20 guests"
  const addMatch = text.match(/\+\s*(\d+)\s*guests?/i) ?? text.match(/add\s+(\d+)\s*guests?/i);
  if (addMatch) return parseInt(addMatch[1], 10);

  const removeMatch = text.match(/-\s*(\d+)\s*guests?/i) ?? text.match(/remove\s+(\d+)\s*guests?/i);
  if (removeMatch) return -parseInt(removeMatch[1], 10);

  return 0;
}

function parseBudgetMultiplier(text: string): number {
  // Match "budget -10%", "budget +20%", "reduce budget by 15%", "increase budget by 25%"
  const reduceMatch =
    text.match(/budget\s*-\s*(\d+)%/i) ??
    text.match(/reduce\s+budget\s+(?:by\s+)?(\d+)%/i) ??
    text.match(/cut\s+budget\s+(?:by\s+)?(\d+)%/i);
  if (reduceMatch) return 1 - parseInt(reduceMatch[1], 10) / 100;

  const increaseMatch =
    text.match(/budget\s*\+\s*(\d+)%/i) ??
    text.match(/increase\s+budget\s+(?:by\s+)?(\d+)%/i);
  if (increaseMatch) return 1 + parseInt(increaseMatch[1], 10) / 100;

  return 1;
}

function parseWeeksEarlier(text: string): number {
  // Match "2 weeks earlier", "move event 3 weeks earlier"
  const match = text.match(/(\d+)\s*weeks?\s*earlier/i);
  return match ? parseInt(match[1], 10) : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — used by React components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls the Gemini AI backend with automatic fallback to deterministic engines.
 * NEVER throws — always returns an AiResponsePayload.
 */
export async function callTyoharAI(
  action: AiAction,
  data: Record<string, unknown>,
): Promise<AiResponsePayload> {
  // Check if we're online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    return deterministicFallback(action, data);
  }

  try {
    const payload: AiRequestPayload = { action, data };
    const response = await callGeminiApi(payload);
    return response;
  } catch {
    // Network error, rate limit, server error — fall back gracefully
    return deterministicFallback(action, data);
  }
}

