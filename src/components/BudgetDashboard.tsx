/**
 * @file BudgetDashboard.tsx
 * @description Orchestrator for Celebration Financial Ledger, 20% Cost Overrun Shield,
 * and Priority-Weighted Trade-Off Resolvers.
 */

import React, { useMemo } from 'react';
import type { EventPlan, TradeOffOption } from '../types/tyohar';
import { generateOverBudgetTradeOffs } from '../utils/budgetEngine';
import {
  GuidedPageHero,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';
import { BudgetHealthHero } from './budget/BudgetHealthHero';
import { BudgetLineItemsGrid } from './budget/BudgetLineItemsGrid';
import { BudgetTradeOffResolver } from './budget/BudgetTradeOffResolver';
import { formatINR } from '../utils/formatters';
import { OVERRUN_STRESS_MULTIPLIER } from '../constants/config';

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
          notes: `${cat.notes ? cat.notes + ' ' : ''}[Applied cut: ${tradeOff.title} (-${formatINR(tradeOff.savingsAmount)})]`,
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
          estimatedCost: Math.round(cat.estimatedCost * OVERRUN_STRESS_MULTIPLIER),
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
        <BudgetHealthHero
          totalBudgetINR={currentPlan.totalBudgetINR}
          totalEstimatedCost={totalEstimatedCost}
          overage={overage}
          percentUsed={percentUsed}
          onSimulateOverrun={handleSimulateOverrun}
        />
      </StaggerItem>

      {/* ── Main Layout: Category Cards Grid & Resolver ─────────────────── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <BudgetLineItemsGrid
              categories={currentPlan.budgetCategories}
              onToggleConfirmedQuote={handleToggleConfirmedQuote}
              onNudgeAllocation={handleNudgeAllocation}
            />
          </div>

          <div className="lg:col-span-4">
            <BudgetTradeOffResolver
              totalBudgetINR={currentPlan.totalBudgetINR}
              overageAmount={overageAnalysis.overageAmount}
              tradeOffOptions={overageAnalysis.options}
              onApplyTradeOff={handleApplyTradeOff}
            />
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
