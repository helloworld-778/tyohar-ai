/**
 * @file BudgetTradeOffResolver.tsx
 * @description Priority Shield & Budget Rebalancer panel suggesting deterministic cuts
 * targeting lower-priority categories first to resolve budget deficits.
 */

import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { TradeOffOption } from '../../types/tyohar';
import { formatINR } from '../../utils/formatters';

interface BudgetTradeOffResolverProps {
  totalBudgetINR: number;
  overageAmount: number;
  tradeOffOptions: TradeOffOption[];
  onApplyTradeOff: (option: TradeOffOption) => void;
}

export const BudgetTradeOffResolver: React.FC<BudgetTradeOffResolverProps> = ({
  totalBudgetINR,
  overageAmount,
  tradeOffOptions,
  onApplyTradeOff,
}) => {
  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
      <div className="border-b border-[#E4DEC8]/60 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[#161412]">
            Priority Shield &amp; Budget Rebalancer
          </h3>
        </div>
        <p className="text-xs text-[#686259] mt-1">
          Automated rebalancing preserving your #1 non-negotiable priority.
        </p>
      </div>

      {overageAmount > 0 ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl border border-[#C23B22]/30 bg-[#FDF2F0] text-xs text-[#C23B22] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C23B22] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="block font-bold text-[#C23B22]">
                Deficit: {formatINR(overageAmount)}
              </strong>
              <p className="text-[11px] text-[#686259] mt-0.5 leading-relaxed">
                Cuts rank lowest-priority unconfirmed categories first.
              </p>
            </div>
          </div>

          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#686259]">
            Recommended Trade-Off Cuts:
          </span>

          <div className="space-y-3">
            {tradeOffOptions.map((option: TradeOffOption) => (
              <div
                key={option.id}
                className="rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] p-3.5 space-y-2 hover:border-[#B4690E]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-[#161412] leading-snug">
                    {option.title}
                  </span>
                  <span className="font-mono-numeric font-bold text-[#1E5631] text-xs shrink-0">
                    -{formatINR(option.savingsAmount)}
                  </span>
                </div>

                <p className="text-[11px] text-[#686259] leading-relaxed">
                  {option.impactDescription}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#E4DEC8]/60">
                  <span className="text-[11px] text-[#B4690E] font-medium">
                    {option.categoryAffected}
                  </span>
                  <button
                    type="button"
                    onClick={() => onApplyTradeOff(option)}
                    aria-label={`Apply trade-off cut: ${option.title}`}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#1E5631] hover:bg-[#163E23] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Apply Cut</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-[#1E5631]/20 bg-[#EEF7F0] text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#1E5631] mx-auto" aria-hidden="true" />
          <h4 className="text-xs font-bold text-[#161412]">Budget Balanced</h4>
          <p className="text-[11px] text-[#686259] leading-relaxed">
            Estimated market benchmarks fit comfortably within your {formatINR(totalBudgetINR)} target ceiling.
          </p>
        </div>
      )}
    </div>
  );
};

