import { describe, it, expect } from 'vitest';
import {
  calculateSmartPlateBuffer,
  recalculateBudgetAllocations,
  generateOverBudgetTradeOffs,
} from '../utils/budgetEngine';
import type { PriorityWeights, BudgetCategory } from '../types/tyohar';

describe('Deterministic Budget Engine', () => {
  describe('calculateSmartPlateBuffer', () => {
    it('calculates guaranteed vs buffer plate split with positive Rupee savings for an Indian wedding', () => {
      const guests = 200;
      const perPlateCost = 1500;
      const calculation = calculateSmartPlateBuffer(guests, 'wedding', false, perPlateCost);

      expect(calculation.invitedGuests).toBe(200);
      // Wedding turnout band is 85-92% (midpoint ~89%)
      expect(calculation.expectedTurnoutPercent).toBeGreaterThanOrEqual(85);
      expect(calculation.expectedTurnoutPercent).toBeLessThanOrEqual(92);

      // Guaranteed base plates must be strictly less than total invited guests
      expect(calculation.guaranteedBasePlates).toBeLessThan(guests);
      expect(calculation.guaranteedBasePlates).toBeGreaterThan(160);

      // Buffer plates should be between 8-12% of guaranteed plates
      expect(calculation.bufferPlates).toBeGreaterThan(0);
      expect(calculation.bufferPlates).toBeLessThan(30);

      // Positive Rupee savings on unconsumed base plates vs naive 100% ordering
      expect(calculation.estimatedSavingsINR).toBeGreaterThan(0);
      const expectedPlatesSaved = guests - calculation.guaranteedBasePlates - calculation.bufferPlates;
      expect(calculation.estimatedSavingsINR).toBe(expectedPlatesSaved * perPlateCost);
    });

    it('generates a 3-step zero-waste surplus redistribution action checklist when buffer > 15 plates', () => {
      // 300 guests in a community event creates buffer > 15 plates
      const calculation = calculateSmartPlateBuffer(300, 'community', false, 100);

      expect(calculation.bufferPlates).toBeGreaterThan(15);
      expect(calculation.surplusRedistributionPlan.length).toBe(3);
      expect(calculation.surplusRedistributionPlan[0]).toContain('Step 1 — Pack & Distribute');
      expect(calculation.surplusRedistributionPlan[1]).toContain('Step 2 — Community Share');
      expect(calculation.surplusRedistributionPlan[2]).toContain('Step 3 — Compost Responsibly');
    });

    it('does not generate surplus redistribution plan when buffer is 15 plates or fewer', () => {
      // 50 guests in a birthday creates small buffer <= 15 plates
      const calculation = calculateSmartPlateBuffer(50, 'birthday', false, 300);

      expect(calculation.bufferPlates).toBeLessThanOrEqual(15);
      expect(calculation.surplusRedistributionPlan).toEqual([]);
    });

    it('applies a peak/auspicious weekend turnout bump (+3%) without exceeding 100%', () => {
      const normal = calculateSmartPlateBuffer(200, 'wedding', false, 1400);
      const peak = calculateSmartPlateBuffer(200, 'wedding', true, 1400);

      expect(peak.expectedTurnoutPercent).toBe(normal.expectedTurnoutPercent + 3);
      expect(peak.guaranteedBasePlates).toBeGreaterThanOrEqual(normal.guaranteedBasePlates);
      expect(peak.expectedTurnoutPercent).toBeLessThanOrEqual(100);
    });
  });

  describe('recalculateBudgetAllocations', () => {
    const weights: PriorityWeights = {
      food: 5,
      venue: 4,
      decor: 3,
      photography: 3,
      entertainment: 1,
    };

    it('proportionally scales allocations according to priority weights', () => {
      const totalBudget = 800000;
      const categories = recalculateBudgetAllocations(totalBudget, 100, weights, []);

      expect(categories.length).toBe(5);

      const foodCat = categories.find((c) => c.name === 'Food & Catering')!;
      const venueCat = categories.find((c) => c.name === 'Venue')!;
      const entertainmentCat = categories.find((c) => c.name === 'Entertainment & Music')!;

      // Food (weight 5) > Venue (weight 4) > Entertainment (weight 1)
      expect(foodCat.allocatedAmount).toBeGreaterThan(venueCat.allocatedAmount);
      expect(venueCat.allocatedAmount).toBeGreaterThan(entertainmentCat.allocatedAmount);

      // Allocations should sum to totalBudget
      const sumAllocated = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(Math.abs(sumAllocated - totalBudget)).toBeLessThanOrEqual(5); // rounding tolerance
    });

    it('scales guest-dependent categories (Food & Venue) when guest count scales', () => {
      const totalBudget = 600000;
      const cats100 = recalculateBudgetAllocations(totalBudget, 100, weights, []);
      const cats200 = recalculateBudgetAllocations(totalBudget, 200, weights, []);

      const food100 = cats100.find((c) => c.name === 'Food & Catering')!;
      const food200 = cats200.find((c) => c.name === 'Food & Catering')!;

      // 200 guests should result in ~2.0x higher estimated cost than 100 guests
      expect(food200.estimatedCost).toBeGreaterThan(food100.estimatedCost);
      expect(food200.estimatedCost).toBe(food100.allocatedAmount * 2);
    });

    it('preserves confirmed vendor quotes from being overwritten', () => {
      const existing: BudgetCategory[] = [
        {
          id: 'cat-venue',
          name: 'Venue',
          allocatedAmount: 150000,
          estimatedCost: 200000,
          isConfirmedQuote: true,
          priority: 4,
          notes: 'Signed contract',
        },
        {
          id: 'cat-decor',
          name: 'Décor & Flowers',
          allocatedAmount: 100000,
          estimatedCost: 100000,
          isConfirmedQuote: false,
          priority: 3,
          notes: '',
        },
      ];

      const updated = recalculateBudgetAllocations(900000, 150, weights, existing);
      const venue = updated.find((c) => c.name === 'Venue')!;

      expect(venue.isConfirmedQuote).toBe(true);
      expect(venue.estimatedCost).toBe(200000); // Quote preserved
    });
  });

  describe('generateOverBudgetTradeOffs', () => {
    it('simulates a 20% budget overrun on an ₹8,00,000 wedding and cuts lower-priority categories first', () => {
      const totalBudget = 800000;
      const weights: PriorityWeights = {
        food: 5,
        venue: 4,
        decor: 3,
        photography: 2,
        entertainment: 1,
      };

      // 20% overrun: total estimated = ₹9,60,000 (over by ₹1,60,000)
      const categories: BudgetCategory[] = [
        { id: '1', name: 'Food & Catering', allocatedAmount: 280000, estimatedCost: 360000, isConfirmedQuote: false, priority: 5, notes: '' },
        { id: '2', name: 'Venue', allocatedAmount: 200000, estimatedCost: 230000, isConfirmedQuote: false, priority: 4, notes: '' },
        { id: '3', name: 'Décor & Flowers', allocatedAmount: 150000, estimatedCost: 170000, isConfirmedQuote: false, priority: 3, notes: '' },
        { id: '4', name: 'Photography & Video', allocatedAmount: 100000, estimatedCost: 120000, isConfirmedQuote: false, priority: 2, notes: '' },
        { id: '5', name: 'Entertainment & Music', allocatedAmount: 70000, estimatedCost: 80000, isConfirmedQuote: false, priority: 1, notes: '' },
      ];

      const totalEstimated = categories.reduce((sum, c) => sum + c.estimatedCost, 0);
      expect(totalEstimated).toBe(960000);

      const result = generateOverBudgetTradeOffs(totalBudget, categories, weights);

      expect(result.overageAmount).toBe(160000);
      expect(result.overagePercent).toBe(20);
      expect(result.options.length).toBeGreaterThan(0);

      // Verify ranking: Lowest priority category (Entertainment, priority 1) MUST be targeted first!
      expect(result.options[0].categoryAffected).toBe('Entertainment & Music');
      // Second proposed option must be Photography (priority 2)
      expect(result.options[1].categoryAffected).toBe('Photography & Video');
      // Third proposed option must be Décor (priority 3)
      expect(result.options[2].categoryAffected).toBe('Décor & Flowers');

      // The highest priority category (Food & Catering, priority 5) is placed last to protect core celebration experience
      const lastOption = result.options[result.options.length - 1];
      expect(lastOption.categoryAffected).toBe('Food & Catering');
    });

    it('returns zero overage and empty trade-offs when estimated expenses are within budget', () => {
      const weights: PriorityWeights = { food: 5, venue: 4, decor: 3, photography: 2, entertainment: 1 };
      const categories: BudgetCategory[] = [
        { id: '1', name: 'Food & Catering', allocatedAmount: 400000, estimatedCost: 350000, isConfirmedQuote: false, priority: 5, notes: '' },
      ];

      const result = generateOverBudgetTradeOffs(500000, categories, weights);
      expect(result.overageAmount).toBe(0);
      expect(result.overagePercent).toBe(0);
      expect(result.options).toEqual([]);
    });

    it('skips confirmed quote categories from trade-off cuts', () => {
      const totalBudget = 300000;
      const weights: PriorityWeights = { food: 5, venue: 4, decor: 3, photography: 2, entertainment: 1 };
      const categories: BudgetCategory[] = [
        // Entertainment has lowest priority (1), but is confirmed quote -> MUST be skipped
        { id: '1', name: 'Entertainment & Music', allocatedAmount: 50000, estimatedCost: 80000, isConfirmedQuote: true, priority: 1, notes: 'Non-refundable' },
        { id: '2', name: 'Photography & Video', allocatedAmount: 80000, estimatedCost: 150000, isConfirmedQuote: false, priority: 2, notes: '' },
        { id: '3', name: 'Food & Catering', allocatedAmount: 170000, estimatedCost: 200000, isConfirmedQuote: false, priority: 5, notes: '' },
      ];

      const result = generateOverBudgetTradeOffs(totalBudget, categories, weights);
      const affected = result.options.map((o) => o.categoryAffected);

      expect(affected).not.toContain('Entertainment & Music');
      expect(affected[0]).toBe('Photography & Video');
    });
  });
});

