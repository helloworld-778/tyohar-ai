/**
 * @file OverviewBudgetLedgerBar.tsx
 * @description Executive proportional budget ledger bar displaying horizontal
 * category distribution and itemized breakdown cards.
 */

import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { BudgetCategory } from '../../types/tyohar';
import { formatINR } from '../../utils/formatters';

interface OverviewBudgetLedgerBarProps {
  categories: BudgetCategory[];
  totalBudgetINR: number;
  onNavigateBudget: () => void;
}

export const OverviewBudgetLedgerBar: React.FC<OverviewBudgetLedgerBarProps> = ({
  categories,
  totalBudgetINR,
  onNavigateBudget,
}) => {
  const categoryColors: Record<string, string> = {
    'Food & Catering': 'bg-[#B4690E]',
    Venue: 'bg-[#2B4C7E]',
    'Décor & Flowers': 'bg-[#C23B22]',
    'Photography & Video': 'bg-[#1E5631]',
    'Entertainment & Music': 'bg-[#854D0E]',
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-[3px_3px_0px_#E4DEC8]">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4DEC8]/60 gap-2">
          <div>
            <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
              <span>Executive Proportional Budget Ledger</span>
            </h3>
            <p className="text-xs text-[#686259] mt-0.5">
              Proportionally balanced across your 1–5 priority weights.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateBudget}
            aria-label="Open detailed Budget & Trade-Offs ledger"
            className="flex items-center gap-1.5 text-xs font-bold text-[#B4690E] hover:text-[#92540C] transition-colors cursor-pointer"
          >
            <span>Open Ledger</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Multi-Segment Horizontal Visual Bar */}
        <div className="mt-6 h-4 w-full rounded-full bg-[#F3EFE6] p-0.5 overflow-hidden flex border border-[#E4DEC8]">
          {categories.map((cat) => {
            const pct = Math.max(
              5,
              Math.round(
                (cat.allocatedAmount / Math.max(1, totalBudgetINR)) * 100,
              ),
            );
            return (
              <div
                key={cat.id}
                title={`${cat.name}: ${formatINR(cat.allocatedAmount)} (${pct}%)`}
                className={`h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full ${
                  categoryColors[cat.name] || 'bg-[#686259]'
                }`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>

        {/* Category Breakdown Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    categoryColors[cat.name] || 'bg-[#686259]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[#161412] font-medium truncate">{cat.name}</span>
              </div>
              <div className="text-right font-mono-numeric">
                <span className="font-bold text-[#161412] block">
                  {formatINR(cat.allocatedAmount)}
                </span>
                <span className="text-[11px] text-[#8C8275]">
                  Est: {formatINR(cat.estimatedCost)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between text-xs text-[#686259]">
        <span className="text-[11px] text-[#8C8275]">
          Badged as Estimated Market Benchmark (Unconfirmed)
        </span>
        <span className="font-bold text-[#161412]">
          Total: {formatINR(totalBudgetINR)}
        </span>
      </div>
    </div>
  );
};

