// ─────────────────────────────────────────────────────────────────────────────
// Tyohar AI — Input Sanitisation & Validation Utilities
// Pure functions — zero side-effects, 100% testable.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Known prompt-injection trigger phrases that must be neutralised before
 * any text reaches a GenAI model or is rendered in the UI.
 *
 * Each pattern is matched case-insensitively against the input string.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /ignore\s+(all\s+)?above\s+instructions/gi,
  /disregard\s+(all\s+)?previous/gi,
  /you\s+are\s+now\s+/gi,
  /pretend\s+you\s+are/gi,
  /act\s+as\s+(if\s+)?/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<<SYS>>/gi,
  /<\/SYS>>/gi,
  /\bDAN\b/g,
  /do\s+anything\s+now/gi,
  /jailbreak/gi,
  /bypass\s+(safety|filter|content)/gi,
];

/**
 * Strips HTML tags, neutralises prompt-injection sequences, trims whitespace,
 * and enforces a maximum character length.
 *
 * @param input    Raw user-supplied string.
 * @param maxLength  Maximum allowed length after cleaning (default 2000).
 * @returns A safe, trimmed string ready for display or AI prompt embedding.
 */
export function sanitizeTextInput(
  input: string,
  maxLength: number = 2000,
): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Strip HTML/XML tags (e.g. <script>, <style>, <img onerror>, etc.)
  // Matches < followed by optional slash and an ASCII tag name, or HTML comments
  let cleaned = input.replace(/<(?:\/?[a-zA-Z][^>]*|!--[\s\S]*?--)>/g, '');

  // 2. Neutralise remaining dangling angle brackets
  cleaned = cleaned.replace(/</g, '＜').replace(/>/g, '＞');

  // 3. Remove known prompt-injection control sequences
  for (const pattern of INJECTION_PATTERNS) {
    // Reset lastIndex for global regexes (they are stateful)
    pattern.lastIndex = 0;
    cleaned = cleaned.replace(pattern, '[filtered]');
  }

  // 4. Collapse excessive whitespace & trim
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // 5. Enforce length bound
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

/**
 * Safely coerces an unknown value to a number within [min, max].
 *
 * Returns `fallback` when:
 *  - the value is not a number (or cannot be parsed as one)
 *  - the parsed number is NaN, Infinity, or outside [min, max]
 *
 * @param value     The raw value from user input / query params / JSON body.
 * @param min       Minimum acceptable value (inclusive).
 * @param max       Maximum acceptable value (inclusive).
 * @param fallback  Safe default returned on invalid input.
 */
export function validatePositiveNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  let num: number;

  if (typeof value === 'number') {
    num = value;
  } else if (typeof value === 'string') {
    num = Number(value);
  } else {
    return fallback;
  }

  if (!Number.isFinite(num)) {
    return fallback;
  }

  if (num < min || num > max) {
    return fallback;
  }

  return num;
}

