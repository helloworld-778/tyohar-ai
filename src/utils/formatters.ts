/**
 * @file formatters.ts
 * @description Pure utility formatters for Indian Rupee currency (INR), percentages,
 * compact metric notation (Lakhs / Crores), and attendance plates.
 */

/**
 * Formats a numerical amount into Indian Rupee (INR) representation with comma groupings.
 * e.g., 1250000 -> "₹12,50,000", -15000 -> "-₹15,000", 0 -> "₹0"
 *
 * @param amount - The numeric value to format.
 * @returns Formatted INR string with currency symbol.
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const rounded = Math.round(amount);
  if (rounded < 0) {
    return `-₹${Math.abs(rounded).toLocaleString('en-IN')}`;
  }
  return `₹${rounded.toLocaleString('en-IN')}`;
}

/**
 * Formats large Indian Rupee figures into compact, human-readable units (K, L, Cr).
 * e.g., 2500000 -> "₹25 L", 12000000 -> "₹1.2 Cr", 85000 -> "₹85 K", 450 -> "₹450"
 *
 * @param amount - The numeric value to format.
 * @returns Compact INR string with Lakhs/Crores indicator.
 */
export function formatCompactINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const prefix = isNegative ? '-₹' : '₹';

  if (abs >= 10_000_000) {
    const cr = abs / 10_000_000;
    const formatted = cr >= 10 ? cr.toFixed(0) : cr.toFixed(1).replace(/\.0$/, '');
    return `${prefix}${formatted} Cr`;
  }
  if (abs >= 100_000) {
    const l = abs / 100_000;
    const formatted = l >= 100 ? l.toFixed(0) : l.toFixed(1).replace(/\.0$/, '');
    return `${prefix}${formatted} L`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    const formatted = k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, '');
    return `${prefix}${formatted} K`;
  }

  return `${prefix}${Math.round(abs).toLocaleString('en-IN')}`;
}

/**
 * Formats a fraction or ratio into an integer or specified decimal percentage string.
 * e.g., 12.4 -> "12%", (12.456, 1) -> "12.5%"
 *
 * @param value - The percentage value (e.g. 15 for 15%).
 * @param decimals - Number of decimal places (default 0).
 * @returns Formatted percentage string.
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  if (!Number.isFinite(value)) return '0%';
  if (decimals <= 0) {
    return `${Math.round(value)}%`;
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a guest plate headcount with proper pluralization and Indian commas.
 * e.g., 350 -> "350 plates", 1 -> "1 plate"
 *
 * @param count - Total number of plates or attendees.
 * @returns Formatted plate count string.
 */
export function formatPlates(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0 plates';
  const rounded = Math.round(count);
  return `${rounded.toLocaleString('en-IN')} ${rounded === 1 ? 'plate' : 'plates'}`;
}

