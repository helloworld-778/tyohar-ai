/**
 * @file BudgetHealthHero.tsx
 * @description High-contrast financial health summary bar comparing total budget target
 * against projected market spend, with 20% cost overrun stress-testing capability.
 */

import React from 'react';
import { Flame } from 'lucide-react';
import { AnimatedCurrency } from '../ui/Primitives';
import { formatINR } from '../../utils/formatters';

interface BudgetHealthHeroProps {
  totalBudgetINR: number;
  totalEstimatedCost: number;
  overage: number;
  percentUsed: number;
  onSimulateOverrun: () => void;
}

export const BudgetHealthHero: React.FC<BudgetHealthHeroProps> = ({
  totalBudgetINR,
  totalEstimatedCost,
  overage,
  percentUsed,
  onSimulateOverrun,
}) => {
  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Overall Financial Standing */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#686259]">
              Fiscal Health Status:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                overage > 0
                  ? 'bg-[#FDF2F0] text-[#C23B22] border-[#C23B22]/30'
                  : 'bg-[#EEF7F0] text-[#1E5631] border-[#1E5631]/30'
              }`}
            >
              {overage > 0 ? `${percentUsed}% Used (Deficit Detected)` : `${percentUsed}% Used (Balanced)`}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4">
            <div>
              <span className="text-xs text-[#686259] block">Total Budget Target</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#161412] font-mono-numeric">
                <AnimatedCurrency amount={totalBudgetINR} />
              </div>
            </div>

            <div className="text-[#8C8275] text-2xl hidden sm:block">/</div>

            <div>
              <span className="text-xs text-[#686259] block">Projected Total Spend</span>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono-numeric ${
                  overage > 0 ? 'text-[#C23B22]' : 'text-[#1E5631]'
                }`}
              >
                <AnimatedCurrency amount={totalEstimatedCost} />
              </div>
            </div>

            {overage > 0 && (
              <div className="rounded-xl border border-[#C23B22]/30 bg-[#FDF2F0] px-3 py-1.5 text-xs text-[#C23B22]">
                <span className="font-bold">Overrun: </span>
                <span className="font-mono-numeric font-bold">+{formatINR(overage)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: +20% Overrun Test Trigger */}
        <button
          type="button"
          onClick={onSimulateOverrun}
          aria-label="Simulate peak-season 20% cost overrun across unconfirmed categories"
          className="flex items-center gap-2.5 rounded-xl border border-[#B4690E]/40 bg-[#FAF7F2] hover:bg-[#F3EFE6] px-5 py-3 text-xs font-bold text-[#B4690E] shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Flame className="h-4 w-4 text-[#B4690E]" aria-hidden="true" />
          <span>Simulate +20% Cost Overrun</span>
        </button>
      </div>

      {/* Micro Progress Track */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#F3EFE6] border border-[#E4DEC8]">
        <div
          className={`h-full transition-all duration-700 ${
            overage > 0 ? 'bg-[#C23B22]' : 'bg-[#1E5631]'
          }`}
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>
    </div>
  );
};

