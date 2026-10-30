import { describe, it, expect, beforeEach } from 'vitest';
import {
  setBYOKApiKey,
  getBYOKApiKey,
  clearBYOKApiKey,
  callTyoharAI,
} from '../services/aiClient';
import { PRESET_WEDDING } from '../data/presets';

describe('AI Client & Deterministic Fallback Engine', () => {
  beforeEach(() => {
    clearBYOKApiKey();
  });

  describe('BYOK Client-Side Key Isolation', () => {
    it('manages user-supplied API keys safely in session storage without leaking', () => {
      expect(getBYOKApiKey()).toBeNull();
      setBYOKApiKey('test_ai_studio_key_sample');
      expect(getBYOKApiKey()).toBe('test_ai_studio_key_sample');
      clearBYOKApiKey();
      expect(getBYOKApiKey()).toBeNull();
    });
  });

  describe('Offline & Rate-Limit Fallback Safety', () => {
    it('executes fallback for GENERATE_CUSTOM_PLAN returning fully populated EventPlan entities', async () => {
      const response = await callTyoharAI('GENERATE_CUSTOM_PLAN', {
        eventType: 'wedding',
        totalBudgetINR: 800000,
        guestCount: 200,
        priorityWeights: { food: 5, venue: 4, decor: 3, photography: 2, entertainment: 1 },
      });

      expect(response.success).toBe(true);
      expect(response.isFallback).toBe(true);

      const res = response.result as {
        budgetCategories: unknown[];
        smartPlate: unknown;
        timeline: unknown[];
        vendorPackages: unknown[];
      };

      expect(Array.isArray(res.budgetCategories)).toBe(true);
      expect(res.budgetCategories.length).toBe(5);
      expect(res.smartPlate).toBeDefined();
      expect(Array.isArray(res.timeline)).toBe(true);
      expect(Array.isArray(res.vendorPackages)).toBe(true);
      expect(res.vendorPackages.length).toBe(3);
    });

    it('executes fallback for OPTIMIZE_VENDOR_MENU returning 3 distinct packages', async () => {
      const response = await callTyoharAI('OPTIMIZE_VENDOR_MENU', {
        guestCount: 250,
        foodType: 'Pure Vegetarian',
        budgetINR: 350000,
      });

      expect(response.success).toBe(true);
      expect(response.isFallback).toBe(true);

      const res = response.result as {
        vendorPackages: { mode: string; title: string; totalEstimatedINR: number }[];
      };
      expect(res.vendorPackages.length).toBe(3);
      const modes = res.vendorPackages.map((p) => p.mode);
      expect(modes).toContain('minimize_cost');
      expect(modes).toContain('balanced');
      expect(modes).toContain('maximize_variety');
    });

    it('executes fallback for AUDIT_VENDOR_QUOTES returning negotiation checklist', async () => {
      const response = await callTyoharAI('AUDIT_VENDOR_QUOTES', {
        quotes: ['Catering estimate ₹1,500/plate for 200 guests'],
      });

      expect(response.success).toBe(true);
      expect(response.isFallback).toBe(true);

      const res = response.result as { negotiationQuestions: string[] };
      expect(res.negotiationQuestions.length).toBeGreaterThanOrEqual(4);
    });

    it('executes fallback for MUTATE_PLAN_WHAT_IF and computes MutationDiff in-place', async () => {
      const response = await callTyoharAI('MUTATE_PLAN_WHAT_IF', {
        currentPlan: PRESET_WEDDING,
        changeDescription: '+50 guests, budget -10%, 2 weeks earlier',
      });

      expect(response.success).toBe(true);
      expect(response.isFallback).toBe(true);

      const res = response.result as {
        mutationDiff: {
          previousBudget: number;
          newBudget: number;
          previousGuests: number;
          newGuests: number;
          timelineShifts: string[];
          budgetAdjustments: string[];
        };
      };

      expect(res.mutationDiff.previousGuests).toBe(200);
      expect(res.mutationDiff.newGuests).toBe(250);
      expect(res.mutationDiff.newBudget).toBe(Math.round(800000 * 0.9));
      expect(res.mutationDiff.timelineShifts.length).toBeGreaterThan(0);
    });
  });
});

