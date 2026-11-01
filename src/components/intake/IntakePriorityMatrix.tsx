/**
 * @file IntakePriorityMatrix.tsx
 * @description Priority Weight Matrix (1 to 5) allowing hosts to set cultural weights
 * across Food, Venue, Decor, Photography, and Entertainment with automatic cut protection badges.
 */

import React from 'react';
import { Flame } from 'lucide-react';
import type { PriorityWeights, BudgetCategory } from '../../types/tyohar';
import { PRIORITY_WEIGHT_METADATA } from '../../constants/config';
import { formatINR } from '../../utils/formatters';

interface IntakePriorityMatrixProps {
  priorityWeights: PriorityWeights;
  budgetCategories: BudgetCategory[];
  onPriorityChange: (key: keyof PriorityWeights, value: number) => void;
}

export const IntakePriorityMatrix: React.FC<IntakePriorityMatrixProps> = ({
  priorityWeights,
  budgetCategories,
  onPriorityChange,
}) => {
  const getProtectionBadge = (weight: number) => {
    if (weight >= 5) {
      return {
        label: 'Priority 5/5 • 100% Protected from Automated Cuts',
        color: 'bg-[#EEF7F0] text-[#1E5631] border-[#1E5631]/30',
      };
    }
    if (weight === 4) {
      return {
        label: 'Priority 4/5 • High Defense against Cost Surges',
        color: 'bg-[#F0F5FA] text-[#2B4C7E] border-[#2B4C7E]/30',
      };
    }
    if (weight === 3) {
      return {
        label: 'Priority 3/5 • Balanced Market Proportionality',
        color: 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8]',
      };
    }
    if (weight === 2) {
      return {
        label: 'Priority 2/5 • Flexible for Trade-Off Rebalancing',
        color: 'bg-[#FEF8ED] text-[#B4690E] border-[#B4690E]/30',
      };
    }
    return {
      label: 'Priority 1/5 • Primary Target for Budget Cuts',
      color: 'bg-[#FDF2F0] text-[#C23B22] border-[#C23B22]/30',
    };
  };

  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
      <div className="border-b border-[#E4DEC8]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
            <span>Priority Weight Matrix (1 to 5)</span>
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Dictates budget weighting and immunizes high-priority vendors from trade-offs.
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#B4690E] bg-[#FEF8ED] border border-[#B4690E]/30 px-2.5 py-1 rounded-full">
          1 = Flexible • 5 = Sacrosanct
        </span>
      </div>

      <div className="space-y-3.5">
        {(Object.keys(priorityWeights) as (keyof PriorityWeights)[]).map((key) => {
          const weight = priorityWeights[key];
          const info = PRIORITY_WEIGHT_METADATA[key];
          const badge = getProtectionBadge(weight);
          const matchedCategory = budgetCategories.find((c) =>
            c.name.toLowerCase().includes(key.substring(0, 4)),
          );

          return (
            <div
              key={key}
              className="p-3.5 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="text-xs font-bold text-[#161412] block">
                    {info.title}
                  </span>
                  <span className="text-[11px] text-[#686259]">
                    {info.desc}
                  </span>
                </div>

                {/* Expressive Protection Pill */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-center shrink-0 ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Interactive Star/Rating Buttons */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-1.5" role="group" aria-label={`Priority rating for ${info.title}`}>
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const isSelected = lvl <= weight;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => onPriorityChange(key, lvl)}
                        aria-pressed={lvl === weight}
                        aria-label={`Set ${info.title} priority to ${lvl} of 5`}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
                          isSelected
                            ? 'bg-[#B4690E] text-white border-[#B4690E] shadow-xs'
                            : 'bg-[#FFFFFF] border-[#E4DEC8] text-[#686259] hover:bg-[#F3EFE6] hover:text-[#161412]'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>

                {/* Proportional allocation snippet */}
                <span className="text-xs font-mono font-bold text-[#161412]">
                  {matchedCategory ? formatINR(matchedCategory.allocatedAmount) : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

