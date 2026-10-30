import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Tag,
  Flame,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { EventPlan, TradeOffOption } from '../types/tyohar';
import { generateOverBudgetTradeOffs } from '../utils/budgetEngine';
import {
  GuidedPageHero,
  AnimatedCurrency,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';

interface BudgetDashboardProps {
  currentPlan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onNavigateTab?: (tab: 'overview' | 'intake' | 'vendor' | 'timeline') => void;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  currentPlan,
  onUpdatePlan,
  onNavigateTab,
}) => {
  const totalEstimatedCost = useMemo(() => {
    return currentPlan.budgetCategories.reduce(
      (sum, cat) => sum + cat.estimatedCost,
      0,
    );
  }, [currentPlan.budgetCategories]);

  const overageAnalysis = useMemo(() => {
    return generateOverBudgetTradeOffs(
      currentPlan.totalBudgetINR,
      currentPlan.budgetCategories,
      currentPlan.priorityWeights,
    );
  }, [
    currentPlan.totalBudgetINR,
    currentPlan.budgetCategories,
    currentPlan.priorityWeights,
  ]);

  const overage = Math.max(0, totalEstimatedCost - currentPlan.totalBudgetINR);
  const percentUsed =
    currentPlan.totalBudgetINR > 0
      ? Math.round((totalEstimatedCost / currentPlan.totalBudgetINR) * 100)
      : 0;

  const handleToggleConfirmedQuote = (categoryId: string) => {
    const updated = currentPlan.budgetCategories.map((cat) => {
      if (cat.id === categoryId) {
        return { ...cat, isConfirmedQuote: !cat.isConfirmedQuote };
      }
      return cat;
    });
    onUpdatePlan({ ...currentPlan, budgetCategories: updated });
  };

  const handleApplyTradeOff = (tradeOff: TradeOffOption) => {
    const updated = currentPlan.budgetCategories.map((cat) => {
      if (cat.name === tradeOff.categoryAffected) {
        const newCost = Math.max(0, cat.estimatedCost - tradeOff.savingsAmount);
        return {
          ...cat,
          estimatedCost: newCost,
          notes: `${cat.notes ? cat.notes + ' ' : ''}[Applied cut: ${tradeOff.title} (-₹${tradeOff.savingsAmount.toLocaleString('en-IN')})]`,
        };
      }
      return cat;
    });
    onUpdatePlan({ ...currentPlan, budgetCategories: updated });
  };

  const handleSimulateOverrun = () => {
    const escalated = currentPlan.budgetCategories.map((cat) => {
      if (!cat.isConfirmedQuote) {
        return {
          ...cat,
          estimatedCost: Math.round(cat.estimatedCost * 1.2),
        };
      }
      return cat;
    });
    onUpdatePlan({ ...currentPlan, budgetCategories: escalated });
  };

  const handleNudgeAllocation = (categoryId: string, delta: number) => {
    const updated = currentPlan.budgetCategories.map((cat) => {
      if (cat.id === categoryId) {
        const newAllocated = Math.max(1000, cat.allocatedAmount + delta);
        return { ...cat, allocatedAmount: newAllocated };
      }
      return cat;
    });
    onUpdatePlan({ ...currentPlan, budgetCategories: updated });
  };

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  return (
    <StaggerContainer className="space-y-6 p-2 lg:p-4 max-w-7xl mx-auto">
      {/* ── Guided Subpage Hero ────────────────────────────────────────── */}
      <StaggerItem>
        <GuidedPageHero
          stepPill="STEP 03 OF 05 • FINANCIAL LEDGER & RESOLVER"
          title="Budget Ledger &amp; 20% Overrun Shield"
          description="A pure deterministic financial control board comparing your target allocation with live market estimates. Lock vendor contracts to freeze them, or trigger automated trade-offs to protect your #1 priority."
          tipsTitle="Budget Engine Rules"
          tips={[
            'Locking a line item as "Confirmed Quote" immunizes it from automated trade-off trimming and price surges.',
            'When over-budget, trade-offs systematically target your lowest-priority categories first (e.g. Entertainment or Décor) so Food & Venue are never degraded.',
            'Simulating +20% overrun tests your plan resilience against notorious peak-season catering rate hikes.',
          ]}
          nextStepLabel="Optimize Vendors & Plates →"
          onNextStep={() => onNavigateTab?.('vendor')}
        />
      </StaggerItem>

      {/* ── High-Contrast Financial Health Hero Bar ────────────────────── */}
      <StaggerItem>
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
                    <AnimatedCurrency amount={currentPlan.totalBudgetINR} />
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
              onClick={handleSimulateOverrun}
              className="flex items-center gap-2.5 rounded-xl border border-[#B4690E]/40 bg-[#FAF7F2] hover:bg-[#F3EFE6] px-5 py-3 text-xs font-bold text-[#B4690E] shadow-xs transition-all shrink-0"
            >
              <Flame className="h-4 w-4 text-[#B4690E]" />
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
      </StaggerItem>

      {/* ── Main Layout: Category Cards Grid & Resolver ─────────────────── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Line Items */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DEC8]/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#161412] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#B4690E]" />
                <span>Line Items &amp; Verified Quotes ({currentPlan.budgetCategories.length})</span>
              </h3>
              <span className="text-[11px] text-[#686259]">
                Lock quotes to immunize from trade-offs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.budgetCategories.map((cat) => {
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
                          onClick={() => handleToggleConfirmedQuote(cat.id)}
                          aria-label={cat.isConfirmedQuote ? 'Unlock quote' : 'Lock quote'}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            cat.isConfirmedQuote
                              ? 'bg-[#EEF7F0] border-[#1E5631]/40 text-[#1E5631]'
                              : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                          }`}
                        >
                          {cat.isConfirmedQuote ? (
                            <>
                              <Lock className="w-3 h-3 text-[#1E5631]" />
                              <span>Quote Locked</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-[#8C8275]" />
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
                            onClick={() => handleNudgeAllocation(cat.id, -5000)}
                            disabled={cat.allocatedAmount <= 5000}
                            className="tactile-btn px-2 py-0.5 rounded bg-[#FFFFFF] text-[11px] font-bold text-[#161412] hover:bg-[#F3EFE6] disabled:opacity-30"
                            title="Decrease allocation by ₹5,000"
                          >
                            - ₹5k
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNudgeAllocation(cat.id, 5000)}
                            className="tactile-btn px-2 py-0.5 rounded bg-[#FFFFFF] text-[11px] font-bold text-[#161412] hover:bg-[#F3EFE6]"
                            title="Increase allocation by ₹5,000"
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

          {/* Right Column (4 cols): Priority Shield Resolver Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
              <div className="border-b border-[#E4DEC8]/60 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B4690E]" />
                  <h3 className="text-sm font-bold text-[#161412]">
                    Priority Shield &amp; Budget Rebalancer
                  </h3>
                </div>
                <p className="text-xs text-[#686259] mt-1">
                  Automated rebalancing preserving your #1 non-negotiable priority.
                </p>
              </div>

              {overageAnalysis.overageAmount > 0 ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-[#C23B22]/30 bg-[#FDF2F0] text-xs text-[#C23B22] flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#C23B22] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-[#C23B22]">
                        Deficit: {formatINR(overageAnalysis.overageAmount)}
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
                    {overageAnalysis.options.map((option: TradeOffOption) => (
                      <div
                        key={option.id}
                        className="rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] p-3.5 space-y-2 hover:border-[#B4690E]/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-[#161412] leading-snug">
                            {option.title}
                          </span>
                          <span className="font-mono-numeric font-bold text-[#1E5631] text-xs shrink-0">
                            -₹{option.savingsAmount.toLocaleString('en-IN')}
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
                            onClick={() => handleApplyTradeOff(option)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#1E5631] hover:bg-[#163E23] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            <span>Apply Cut</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-[#1E5631]/20 bg-[#EEF7F0] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#1E5631] mx-auto" />
                  <h4 className="text-xs font-bold text-[#161412]">Budget Balanced</h4>
                  <p className="text-[11px] text-[#686259] leading-relaxed">
                    Estimated market benchmarks fit comfortably within your ₹
                    {currentPlan.totalBudgetINR.toLocaleString('en-IN')} target ceiling.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Step 03 to 04 Navigation Transition ─────────────────────────── */}
      <StaggerItem>
        <StageNavButtons
          prevLabel="Back to Step 02: Intake Studio"
          onPrev={() => onNavigateTab?.('intake')}
          nextLabel="Proceed to Step 04: Vendors & Smart Plates"
          onNext={() => onNavigateTab?.('vendor')}
        />
      </StaggerItem>
    </StaggerContainer>
  );
};
