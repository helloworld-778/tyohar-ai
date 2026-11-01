/**
 * @file BudgetLineItemsGrid.tsx
 * @description Interactive celebration expense cards featuring verified vendor quote locking,
 * allocation adjustment nudges, and market benchmark status flags.
 */

import React from 'react';
import { Tag, Lock, Unlock } from 'lucide-react';
import type { BudgetCategory } from '../../types/tyohar';
import { AnimatedCurrency } from '../ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { BUDGET_NUDGE_STEP_INR } from '../../constants/config';

interface BudgetLineItemsGridProps {
  categories: BudgetCategory[];
  onToggleConfirmedQuote: (categoryId: string) => void;
  onNudgeAllocation: (categoryId: string, delta: number) => void;
}

export const BudgetLineItemsGrid: React.FC<BudgetLineItemsGridProps> = ({
  categories,
  onToggleConfirmedQuote,
  onNudgeAllocation,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E4DEC8]/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#161412] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
          <span>Line Items &amp; Verified Quotes ({categories.length})</span>
        </h3>
        <span className="text-[11px] text-[#686259]">
          Lock quotes to immunize from trade-offs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const diff = cat.estimatedCost - cat.allocatedAmount;
          const isOver = diff > 0;

          return (
            <div
              key={cat.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                cat.isConfirmedQuote
                  ? 'border-[#1E5631]/40 bg-[#FFFFFF]'
                  : isOver
                  ? 'border-[#B4690E]/40 bg-[#FFFFFF]'
                  : 'border-[#E4DEC8] bg-[#FFFFFF]'
              }`}
            >
              <div>
                {/* Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#161412]">{cat.name}</h4>
                    <span className="text-[11px] text-[#686259]">
                      Priority Weight: {cat.priority}/5
                    </span>
                  </div>

                  {/* Lock / Unlock Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleConfirmedQuote(cat.id)}
                    aria-label={cat.isConfirmedQuote ? `Unlock quote for ${cat.name}` : `Lock verified quote for ${cat.name}`}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      cat.isConfirmedQuote
                        ? 'bg-[#EEF7F0] border-[#1E5631]/40 text-[#1E5631]'
                        : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                    }`}
                  >
                    {cat.isConfirmedQuote ? (
                      <>
                        <Lock className="w-3 h-3 text-[#1E5631]" aria-hidden="true" />
                        <span>Quote Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-[#8C8275]" aria-hidden="true" />
                        <span>Lock Quote</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Amounts Display */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E4DEC8]">
                  <div>
                    <span className="text-[11px] font-medium text-[#686259] block">
                      Allocated Budget
                    </span>
                    <span className="text-sm font-bold text-[#161412] font-mono-numeric">
                      <AnimatedCurrency amount={cat.allocatedAmount} />
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-[#686259] block">
                      Estimated Spend
                    </span>
                    <span
                      className={`text-sm font-bold font-mono-numeric ${
                        isOver ? 'text-[#C23B22]' : 'text-[#161412]'
                      }`}
                    >
                      <AnimatedCurrency amount={cat.estimatedCost} />
                    </span>
                  </div>
                </div>

                {/* Direct Manipulation: Quick Tweak Nudge Buttons */}
                <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E4DEC8]">
                  <span className="text-[11px] font-bold text-[#686259]">Tweak Allocation:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onNudgeAllocation(cat.id, -BUDGET_NUDGE_STEP_INR)}
                      disabled={cat.allocatedAmount <= BUDGET_NUDGE_STEP_INR}
                      className="tactile-btn px-2 py-0.5 rounded bg-[#FFFFFF] text-[11px] font-bold text-[#161412] hover:bg-[#F3EFE6] disabled:opacity-30 cursor-pointer"
                      aria-label={`Decrease ${cat.name} allocation by ₹5,000`}
                    >
                      - ₹5k
                    </button>
                    <button
                      type="button"
                      onClick={() => onNudgeAllocation(cat.id, BUDGET_NUDGE_STEP_INR)}
                      className="tactile-btn px-2 py-0.5 rounded bg-[#FFFFFF] text-[11px] font-bold text-[#161412] hover:bg-[#F3EFE6] cursor-pointer"
                      aria-label={`Increase ${cat.name} allocation by ₹5,000`}
                    >
                      + ₹5k
                    </button>
                  </div>
                </div>

                {/* Notes / Applied Cuts */}
                {cat.notes && (
                  <p className="mt-3 text-[11px] text-[#686259] line-clamp-2 leading-relaxed">
                    {cat.notes}
                  </p>
                )}
              </div>

              {/* Footer Badge */}
              <div className="mt-4 pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    cat.isConfirmedQuote
                      ? 'bg-[#EEF7F0] border-[#1E5631]/30 text-[#1E5631]'
                      : 'bg-[#FEF8ED] border-[#B4690E]/30 text-[#B4690E]'
                  }`}
                >
                  {cat.isConfirmedQuote
                    ? 'Verified Vendor Quote'
                    : 'Estimated Market Benchmark (Unconfirmed)'}
                </span>

                {isOver && (
                  <span className="text-[11px] font-mono-numeric font-bold text-[#C23B22]">
                    +{formatINR(diff)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

