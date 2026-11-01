/**
 * @file config.ts
 * @description Centralized application constants and configuration thresholds for Tyohar AI.
 * Eliminates magic numbers across the celebration planning engines and UI components.
 */

import type { EventType, PriorityWeights } from '../types/tyohar';

/**
 * Expected attendance percentage ranges across authentic Indian celebration archetypes.
 */
export const TURNOUT_BENCHMARKS: Record<EventType, { low: number; high: number; typical: number }> = {
  wedding: { low: 85, high: 92, typical: 88 },
  birthday: { low: 90, high: 95, typical: 92 },
  community: { low: 70, high: 85, typical: 78 },
} as const;

/**
 * Attendance bump percentage applied when an event falls on a Saya / auspicious date.
 */
export const PEAK_MUHURAT_BUMP_PERCENT = 3 as const;

/**
 * Buffer plate percentage ranges negotiated with caterers on standby.
 */
export const BUFFER_BENCHMARKS: Record<EventType, { low: number; high: number; typical: number }> = {
  wedding: { low: 8, high: 12, typical: 10 },
  birthday: { low: 5, high: 8, typical: 6.5 },
  community: { low: 10, high: 15, typical: 12.5 },
} as const;

/**
 * Plate threshold above which the zero-waste surplus redistribution protocol activates.
 */
export const SURPLUS_CHECKLIST_THRESHOLD = 15 as const;

/**
 * Numerical input clamps and validation bounds.
 */
export const INPUT_LIMITS = {
  MIN_GUEST_COUNT: 10,
  MAX_GUEST_COUNT: 5000,
  MIN_BUDGET_INR: 10000,
  MAX_BUDGET_INR: 50000000,
  MIN_PER_PLATE_INR: 50,
  MAX_PER_PLATE_INR: 10000,
  MAX_PROMPT_LENGTH: 4000,
} as const;

/**
 * Budget incremental nudge quantum (₹5,000).
 */
export const BUDGET_NUDGE_STEP_INR = 5000 as const;

/**
 * Peak-season cost overrun stress-test multiplier (20% increase).
 */
export const OVERRUN_STRESS_MULTIPLIER = 1.2 as const;

/**
 * Local and session storage keys.
 */
export const STORAGE_KEYS = {
  ACTIVE_PLAN_DRAFT: 'tyohar_active_plan_draft',
  BYOK_API_KEY: 'tyohar_byok_api_key',
} as const;

/**
 * Standard accessibility and dietary accommodation rules.
 */
export const DEFAULT_ACCESSIBILITY_OPTIONS: readonly string[] = [
  'Wheelchair Ramp & Elevator Access',
  'Low-Decibel Senior Acoustic Zone',
  'Dedicated Jain / Satvik Kitchen Station',
  'Early Kids Dining Counter (5:30 PM)',
  'Low-Sugar Dessert Section for Diabetics',
  'Eco-Friendly Sugarcane / Clay Dinnerware',
] as const;

/**
 * Priority labels and impact descriptions for cultural weighting.
 */
export const PRIORITY_WEIGHT_METADATA: Record<keyof PriorityWeights, { title: string; desc: string }> = {
  food: {
    title: 'Food & Catering',
    desc: 'Menu variety, live counters, dessert stations',
  },
  venue: {
    title: 'Venue & Banquet',
    desc: 'Location grandeur, lawns, air-conditioning',
  },
  decor: {
    title: 'Floral Décor & Lighting',
    desc: 'Stage design, photobooths, entrance arch',
  },
  photography: {
    title: 'Photography & Cinema',
    desc: 'Candid shoots, drone coverage, teaser reels',
  },
  entertainment: {
    title: 'Entertainment & DJ',
    desc: 'Sound setup, folk artists, choreographers',
  },
} as const;

