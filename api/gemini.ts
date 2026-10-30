// ─────────────────────────────────────────────────────────────────────────────
// Tyohar AI — Vercel Serverless API Handler for Gemini AI
// File: api/gemini.ts
// Deployed as /api/gemini on Vercel (Node.js runtime).
//
// This file is self-contained — no imports from src/ — because Vercel
// serverless functions are bundled independently from the Vite frontend.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from '@google/genai';

// ─────────────────────────────────────────────────────────────────────────────
// Local type definitions (mirrors src/types/tyohar.ts — kept in sync manually)
// ─────────────────────────────────────────────────────────────────────────────

type AiAction =
  | 'GENERATE_CUSTOM_PLAN'
  | 'OPTIMIZE_VENDOR_MENU'
  | 'AUDIT_VENDOR_QUOTES'
  | 'MUTATE_PLAN_WHAT_IF';

interface AiRequestPayload {
  action: AiAction;
  data: Record<string, unknown>;
}

interface PriorityWeights {
  food: number;
  decor: number;
  venue: number;
  photography: number;
  entertainment: number;
}

interface DemographicSplit {
  kidsPercent: number;
  adultsPercent: number;
  seniorsPercent: number;
  dietaryTags: string[];
  accessibilityNeeds: string[];
}

interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  estimatedCost: number;
  isConfirmedQuote: boolean;
  priority: number;
  notes: string;
}

interface TimelineTask {
  id: string;
  title: string;
  category: string;
  weeksBefore: number;
  status: 'pending' | 'completed' | 'delayed';
  dependsOn: string[];
  impactIfDelayed: string;
}

interface EventPlanSummary {
  name: string;
  totalBudgetINR: number;
  guestCount: number;
  eventType: string;
  budgetCategories: BudgetCategory[];
  timeline: TimelineTask[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline sanitisation (lightweight server-side — no import from src/)
// ─────────────────────────────────────────────────────────────────────────────

function sanitize(input: unknown, maxLen = 4000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/</g, '\uFF1C')
    .replace(/>/g, '\uFF1E')
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '[filtered]')
    .replace(/ignore\s+(all\s+)?above\s+instructions/gi, '[filtered]')
    .replace(/disregard\s+(all\s+)?previous/gi, '[filtered]')
    .replace(/you\s+are\s+now\s+/gi, '[filtered]')
    .replace(/pretend\s+you\s+are/gi, '[filtered]')
    .replace(/system\s*:\s*/gi, '[filtered]')
    .replace(/jailbreak/gi, '[filtered]')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Valid actions
// ─────────────────────────────────────────────────────────────────────────────

const VALID_ACTIONS = new Set<AiAction>([
  'GENERATE_CUSTOM_PLAN',
  'OPTIMIZE_VENDOR_MENU',
  'AUDIT_VENDOR_QUOTES',
  'MUTATE_PLAN_WHAT_IF',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builders (one per action)
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(action: AiAction, data: Record<string, unknown>): string {
  switch (action) {
    case 'GENERATE_CUSTOM_PLAN':
      return buildCustomPlanPrompt(data);
    case 'OPTIMIZE_VENDOR_MENU':
      return buildVendorMenuPrompt(data);
    case 'AUDIT_VENDOR_QUOTES':
      return buildAuditQuotesPrompt(data);
    case 'MUTATE_PLAN_WHAT_IF':
      return buildMutationPrompt(data);
  }
}

function buildCustomPlanPrompt(data: Record<string, unknown>): string {
  const eventType = sanitize(data.eventType as string);
  const budget = clampNum(data.totalBudgetINR, 1000, 100_000_000, 100000);
  const guests = clampNum(data.guestCount, 1, 100000, 100);
  const weeks = clampNum(data.weeksUntilEvent, 1, 104, 8);
  const priorities = data.priorityWeights as PriorityWeights | undefined;
  const demographics = data.demographics as DemographicSplit | undefined;
  const description = sanitize((data.description as string) ?? '');

  return `You are Tyohar AI, an expert Indian event planner. Generate a COMPLETE event plan as a JSON object.

EVENT DETAILS:
- Type: ${eventType}
- Total Budget: ₹${budget.toLocaleString('en-IN')}
- Guest Count: ${guests}
- Weeks Until Event: ${weeks}
- Description: ${description}
${priorities ? `- Priority Weights: Food=${priorities.food}, Decor=${priorities.decor}, Venue=${priorities.venue}, Photography=${priorities.photography}, Entertainment=${priorities.entertainment}` : ''}
${demographics ? `- Demographics: Kids=${demographics.kidsPercent}%, Adults=${demographics.adultsPercent}%, Seniors=${demographics.seniorsPercent}%\n- Dietary Tags: ${demographics.dietaryTags?.join(', ') || 'None specified'}\n- Accessibility Needs: ${demographics.accessibilityNeeds?.join(', ') || 'None specified'}` : ''}

RESPOND WITH A JSON OBJECT containing these fields:
{
  "budgetCategories": [{ "id": string, "name": string, "allocatedAmount": number, "estimatedCost": number, "isConfirmedQuote": false, "priority": number, "notes": string }],
  "vendorPackages": [{ "mode": "minimize_cost"|"balanced"|"maximize_variety", "title": string, "estimatedPerPersonINR": number, "totalEstimatedINR": number, "menuHighlights": string[], "arrangementHighlights": string[], "pros": string[], "tradeOffs": string[] }],
  "timeline": [{ "id": string, "title": string, "category": string, "weeksBefore": number, "status": "pending", "dependsOn": string[], "impactIfDelayed": string }],
  "vibeAudit": [{ "zone": string, "frictionWarning": string, "accommodationFix": string, "targetGroup": "kids"|"seniors"|"all" }],
  "smartPlate": { "invitedGuests": number, "expectedTurnoutPercent": number, "guaranteedBasePlates": number, "bufferPlates": number, "estimatedSavingsINR": number, "surplusRedistributionPlan": string[] }
}

IMPORTANT RULES:
- All monetary values in INR. Use realistic 2024-25 Indian market benchmarks.
- Generate exactly 3 vendorPackages (one per mode).
- Timeline tasks must have realistic weeksBefore values and dependency chains.
- Vibe Audit must address multi-generational comfort (kids, seniors, all).
- Ensure budget allocations sum close to the total budget.`;
}

function buildVendorMenuPrompt(data: Record<string, unknown>): string {
  const guests = clampNum(data.guestCount, 1, 100000, 100);
  const foodType = sanitize((data.foodType as string) ?? 'Vegetarian');
  const description = sanitize((data.description as string) ?? '');
  const budget = clampNum(data.budgetINR, 0, 100_000_000, 0);

  return `You are Tyohar AI, an Indian catering consultant. Generate 3 vendor food packages (minimize_cost, balanced, maximize_variety) for:

- Guest Count: ${guests}
- Food Preference: ${foodType}
- Budget for Food: ₹${budget.toLocaleString('en-IN')}
- Special Requests: ${description}

RESPOND WITH A JSON OBJECT:
{
  "vendorPackages": [
    {
      "mode": "minimize_cost"|"balanced"|"maximize_variety",
      "title": string,
      "estimatedPerPersonINR": number,
      "totalEstimatedINR": number,
      "menuHighlights": string[],
      "arrangementHighlights": string[],
      "pros": string[],
      "tradeOffs": string[]
    }
  ]
}

Use realistic 2024-25 Indian catering market benchmarks. Each package must be distinctly different in scope, variety, and cost.`;
}

function buildAuditQuotesPrompt(data: Record<string, unknown>): string {
  const quotes = Array.isArray(data.quotes)
    ? (data.quotes as string[]).map((q) => sanitize(q, 3000))
    : [];

  return `You are Tyohar AI, a vendor quote auditor specialising in Indian events. Analyse these ${quotes.length} vendor quotes:

${quotes.map((q, i) => `--- VENDOR QUOTE ${i + 1} ---\n${q}`).join('\n\n')}

RESPOND WITH A JSON OBJECT:
{
  "vendorQuotes": [
    {
      "id": string,
      "vendorName": string,
      "category": string,
      "quotedTotalINR": number,
      "guestsCovered": number,
      "inclusions": string[],
      "hiddenChargesFlagged": string[],
      "missingClarifications": string[],
      "valueScore": number (0-100)
    }
  ],
  "comparisonSummary": string,
  "negotiationQuestions": string[]
}

RULES:
- Extract exact numbers from quotes. Flag any ambiguous pricing.
- Hidden charges: look for service tax, transport, crockery deposits, overtime fees, cancellation clauses.
- Missing clarifications: what the quote doesn't mention but should.
- Value score: 0-100 composite of price fairness, transparency, and inclusions.
- Provide 3-5 specific negotiation questions the client should ask each vendor.`;
}

function buildMutationPrompt(data: Record<string, unknown>): string {
  const currentPlan = data.currentPlan as EventPlanSummary | undefined;
  const changeDescription = sanitize((data.changeDescription as string) ?? '');

  const planSummary = currentPlan
    ? `Current Plan: "${currentPlan.name}", Budget ₹${currentPlan.totalBudgetINR.toLocaleString('en-IN')}, ${currentPlan.guestCount} guests, ${currentPlan.eventType} event.`
    : 'No existing plan provided.';

  return `You are Tyohar AI. A user wants to modify their event plan with this change:

"${changeDescription}"

${planSummary}

${currentPlan ? `Current budget categories: ${JSON.stringify(currentPlan.budgetCategories)}` : ''}
${currentPlan ? `Current timeline: ${JSON.stringify(currentPlan.timeline)}` : ''}

RESPOND WITH A JSON OBJECT:
{
  "mutationDiff": {
    "summary": string,
    "previousBudget": number,
    "newBudget": number,
    "previousGuests": number,
    "newGuests": number,
    "timelineShifts": string[],
    "budgetAdjustments": string[]
  },
  "updatedBudgetCategories": [{ "id": string, "name": string, "allocatedAmount": number, "estimatedCost": number, "isConfirmedQuote": boolean, "priority": number, "notes": string }],
  "updatedTimeline": [{ "id": string, "title": string, "category": string, "weeksBefore": number, "status": "pending"|"completed"|"delayed", "dependsOn": string[], "impactIfDelayed": string }],
  "warnings": string[]
}

Apply the change realistically. Recalculate budget allocations, adjust timeline, and flag any risks.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Handler
// ─────────────────────────────────────────────────────────────────────────────

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => VercelResponse;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-custom-api-key');

  if (req.method === 'OPTIONS') {
    res.status(204).json({});
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    return;
  }

  // Resolve API key: user-supplied BYOK header → server env var
  const customKey = typeof req.headers['x-custom-api-key'] === 'string'
    ? req.headers['x-custom-api-key']
    : undefined;
  const apiKey = customKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(500).json({
      success: false,
      error: 'Gemini API key not configured. Set GEMINI_API_KEY env var or pass x-custom-api-key header.',
    });
    return;
  }

  // Parse & validate payload
  const body = req.body as AiRequestPayload | undefined;
  if (!body || !body.action || !body.data) {
    res.status(400).json({
      success: false,
      error: 'Invalid request body. Expected { action: string, data: object }.',
    });
    return;
  }

  if (!VALID_ACTIONS.has(body.action)) {
    res.status(400).json({
      success: false,
      error: `Invalid action "${body.action}". Valid actions: ${[...VALID_ACTIONS].join(', ')}`,
    });
    return;
  }

  try {
    const prompt = buildPrompt(body.action, body.data);

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text ?? '';

    // Parse JSON from response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      // Attempt to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        parsed = JSON.parse(jsonMatch[1]) as Record<string, unknown>;
      } else {
        throw new Error('Failed to parse AI response as JSON.');
      }
    }

    res.status(200).json({
      success: true,
      action: body.action,
      result: parsed,
      error: '',
      isFallback: false,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error during AI generation.';
    res.status(500).json({
      success: false,
      action: body.action,
      result: {},
      error: message,
      isFallback: false,
    });
  }
}
