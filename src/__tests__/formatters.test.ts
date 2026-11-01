import { describe, it, expect } from 'vitest';
import {
  formatINR,
  formatCompactINR,
  formatPercentage,
  formatPlates,
} from '../utils/formatters';

describe('Formatters Utility Suite', () => {
  describe('formatINR', () => {
    it('formats standard Indian Rupee amounts with Indian numbering grouping', () => {
      expect(formatINR(1250000)).toBe('₹12,50,000');
      expect(formatINR(50000)).toBe('₹50,000');
      expect(formatINR(100)).toBe('₹100');
    });

    it('handles zero correctly', () => {
      expect(formatINR(0)).toBe('₹0');
    });

    it('formats negative figures with leading minus sign', () => {
      expect(formatINR(-25000)).toBe('-₹25,000');
    });

    it('safely handles non-finite inputs', () => {
      expect(formatINR(NaN)).toBe('₹0');
      expect(formatINR(Infinity)).toBe('₹0');
      expect(formatINR(-Infinity)).toBe('₹0');
    });

    it('rounds fractional rupees to nearest whole integer', () => {
      expect(formatINR(99.6)).toBe('₹100');
      expect(formatINR(99.4)).toBe('₹99');
    });
  });

  describe('formatCompactINR', () => {
    it('formats Crores with Cr suffix', () => {
      expect(formatCompactINR(12000000)).toBe('₹1.2 Cr');
      expect(formatCompactINR(20000000)).toBe('₹2 Cr');
      expect(formatCompactINR(150000000)).toBe('₹15 Cr');
    });

    it('formats Lakhs with L suffix', () => {
      expect(formatCompactINR(2500000)).toBe('₹25 L');
      expect(formatCompactINR(150000)).toBe('₹1.5 L');
      expect(formatCompactINR(800000)).toBe('₹8 L');
    });

    it('formats Thousands with K suffix', () => {
      expect(formatCompactINR(85000)).toBe('₹85 K');
      expect(formatCompactINR(5500)).toBe('₹5.5 K');
    });

    it('formats amounts below 1,000 directly', () => {
      expect(formatCompactINR(750)).toBe('₹750');
      expect(formatCompactINR(0)).toBe('₹0');
    });

    it('handles negative compact amounts', () => {
      expect(formatCompactINR(-1500000)).toBe('-₹15 L');
      expect(formatCompactINR(-50000)).toBe('-₹50 K');
    });

    it('safely handles non-finite values', () => {
      expect(formatCompactINR(NaN)).toBe('₹0');
    });
  });

  describe('formatPercentage', () => {
    it('formats whole number percentages by default', () => {
      expect(formatPercentage(15)).toBe('15%');
      expect(formatPercentage(12.7)).toBe('13%');
      expect(formatPercentage(0)).toBe('0%');
    });

    it('supports custom decimal precision', () => {
      expect(formatPercentage(12.345, 1)).toBe('12.3%');
      expect(formatPercentage(88.888, 2)).toBe('88.89%');
    });

    it('safely handles non-finite percentages', () => {
      expect(formatPercentage(NaN)).toBe('0%');
    });
  });

  describe('formatPlates', () => {
    it('formats plural plate counts', () => {
      expect(formatPlates(350)).toBe('350 plates');
      expect(formatPlates(1250)).toBe('1,250 plates');
    });

    it('formats singular plate count', () => {
      expect(formatPlates(1)).toBe('1 plate');
    });

    it('handles zero or negative counts gracefully', () => {
      expect(formatPlates(0)).toBe('0 plates');
      expect(formatPlates(-5)).toBe('0 plates');
      expect(formatPlates(NaN)).toBe('0 plates');
    });
  });
});

